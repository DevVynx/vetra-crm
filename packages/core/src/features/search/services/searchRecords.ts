import { leadDomain } from "../../leads/domain";
import { stageRepositories } from "../../stages/repositories";
import { searchDomain, type SearchGroup } from "../domain";
import { searchRepositories } from "../repositories";

const { GROUP_LIMIT } = searchDomain;

// Everything follows what the Leads list shows. A lead with a deal is in the closing stage, which
// that list leaves out, so it only comes up as a customer. Its notes stay stored but aren't searched:
// no customer screen shows them, so a result would open a page without what was found.
export async function searchRecords(term: string): Promise<SearchGroup[]> {
  const stages = await stageRepositories.findStages();
  const visibleStageIds = leadDomain.visibleStageIdsFor(stages, []);

  const [leads, customers, projects, notes, nextActions] = await Promise.all([
    searchRepositories.searchLeads(term, visibleStageIds, GROUP_LIMIT),
    searchRepositories.searchCustomers(term, GROUP_LIMIT),
    searchRepositories.searchProjects(term, GROUP_LIMIT),
    searchRepositories.searchNotes(term, visibleStageIds, GROUP_LIMIT),
    searchRepositories.searchNextActions(term, visibleStageIds, GROUP_LIMIT),
  ]);

  return [
    { kind: "leads", items: leads.map(searchDomain.fromLead) },
    { kind: "customers", items: customers.map(searchDomain.fromLead) },
    { kind: "projects", items: projects.map(searchDomain.fromOwned) },
    {
      kind: "notes",
      items: notes
        .map((note) => ({ ...note, text: searchDomain.excerptAround(note.text, term) }))
        .map(searchDomain.fromOwned),
    },
    { kind: "next_actions", items: nextActions.map(searchDomain.fromOwned) },
  ];
}
