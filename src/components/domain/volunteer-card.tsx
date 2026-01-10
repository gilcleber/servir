import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Profile } from "@/types"
import { cn } from "@/lib/utils"

interface VolunteerCardProps {
    volunteer: Profile
    className?: string
    onClick?: () => void
}

export function VolunteerCard({ volunteer, className, onClick }: VolunteerCardProps) {
    const initials = volunteer.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()

    return (
        <Card
            className={cn("cursor-pointer hover:shadow-md transition-shadow", className)}
            onClick={onClick}
        >
            <CardContent className="p-4 flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={volunteer.avatar_url} alt={volunteer.name} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg">{volunteer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {/* Display ministries if needed, simplified for now */}
                        Voluntário
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
