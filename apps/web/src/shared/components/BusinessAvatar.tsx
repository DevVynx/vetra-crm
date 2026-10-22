import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

type BusinessAvatarProps = {
  name: string;
  photoUrl?: string;
  className?: string;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter((word) => /^\p{L}/u.test(word) && word.length > 2)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

export function BusinessAvatar({ name, photoUrl, className }: BusinessAvatarProps) {
  return (
    <Avatar className={className}>
      {photoUrl && <AvatarImage src={photoUrl} alt="" />}
      <AvatarFallback className="bg-primary/15 text-primary font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
