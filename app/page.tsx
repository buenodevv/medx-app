import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, TrendingUp, Plus, UserPlus } from "lucide-react"

const upcomingAppointments = [
  {
    id: 1,
    patient: "Maria Silva",
    time: "09:00",
    doctor: "Dr. Roberto",
    type: "Consulta",
    status: "confirmado",
  },
  {
    id: 2,
    patient: "João Santos",
    time: "10:30",
    doctor: "Dra. Ana",
    type: "Retorno",
    status: "pendente",
  },
  {
    id: 3,
    patient: "Ana Costa",
    time: "14:00",
    doctor: "Dr. Roberto",
    type: "Exame",
    status: "confirmado",
  },
]

const stats = [
  {
    title: "Pacientes Hoje",
    value: "12",
    icon: Users,
    trend: "+2 desde ontem",
  },
  {
    title: "Agendamentos",
    value: "24",
    icon: Calendar,
    trend: "+5 esta semana",
  },
  {
    title: "Tempo Médio",
    value: "25min",
    icon: Clock,
    trend: "-3min desde ontem",
  },
  {
    title: "Taxa de Ocupação",
    value: "85%",
    icon: TrendingUp,
    trend: "+12% este mês",
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Cadastrar Paciente
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">{appointment.time}</div>
                  <div>
                    <div className="font-medium">{appointment.patient}</div>
                    <div className="text-sm text-muted-foreground">{appointment.doctor}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{appointment.type}</Badge>
                  <Badge 
                    variant={appointment.status === 'confirmado' ? 'default' : 'secondary'}
                  >
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
