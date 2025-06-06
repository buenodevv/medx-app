import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Mail, Phone, Calendar } from "lucide-react"

const professionals = [
  {
    id: 1,
    name: "Dr. Roberto Silva",
    specialty: "Cardiologia",
    crm: "CRM/SP 123456",
    email: "roberto@medxclinic.com",
    phone: "(11) 99999-9999",
    status: "ativo",
    appointmentsToday: 8,
  },
  {
    id: 2,
    name: "Dra. Ana Costa",
    specialty: "Dermatologia",
    crm: "CRM/SP 654321",
    email: "ana@medxclinic.com",
    phone: "(11) 88888-8888",
    status: "ativo",
    appointmentsToday: 6,
  },
  {
    id: 3,
    name: "Dr. Carlos Santos",
    specialty: "Ortopedia",
    crm: "CRM/SP 789123",
    email: "carlos@medxclinic.com",
    phone: "(11) 77777-7777",
    status: "férias",
    appointmentsToday: 0,
  },
]

export default function ProfissionaisPage() {
  return (
    <div className="flex flex-col">
      <Header title="Profissionais" />

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Equipe Médica</h2>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Profissional
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {professionals.map((professional) => (
            <Card key={professional.id}>
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-lg">
                    {professional.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{professional.name}</CardTitle>
                <p className="text-muted-foreground">{professional.specialty}</p>
                <Badge variant={professional.status === "ativo" ? "default" : "secondary"} className="w-fit mx-auto">
                  {professional.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{professional.crm}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {professional.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {professional.phone}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {professional.appointmentsToday} consultas hoje
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Agenda
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
