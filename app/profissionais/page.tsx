import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Calendar, Plus } from "lucide-react"

const professionals = [
  {
    id: 1,
    name: "Dr. Roberto Silva",
    specialty: "Cardiologia",
    email: "roberto@clinic.com",
    phone: "(11) 99999-9999",
    status: "ativo",
    appointments: 12,
    avatar: "/placeholder-user.jpg"
  },
  {
    id: 2,
    name: "Dra. Ana Costa",
    specialty: "Pediatria",
    email: "ana@clinic.com",
    phone: "(11) 88888-8888",
    status: "ativo",
    appointments: 8,
    avatar: "/placeholder-user.jpg"
  },
  {
    id: 3,
    name: "Dr. Carlos Mendes",
    specialty: "Ortopedia",
    email: "carlos@clinic.com",
    phone: "(11) 77777-7777",
    status: "inativo",
    appointments: 0,
    avatar: "/placeholder-user.jpg"
  },
]

export default function ProfissionaisPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Profissionais</h2>
          <p className="text-muted-foreground">Gerencie os profissionais da sua clínica</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Profissional
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {professionals.map((professional) => (
          <Card key={professional.id}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-lg font-semibold text-gray-600">
                  {professional.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <CardTitle className="text-lg">{professional.name}</CardTitle>
              <Badge variant="outline">{professional.specialty}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{professional.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{professional.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{professional.appointments} agendamentos hoje</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Badge variant={professional.status === 'ativo' ? 'default' : 'secondary'}>
                  {professional.status}
                </Badge>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
