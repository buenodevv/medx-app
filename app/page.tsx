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
    <div className="flex flex-col">
      <Header title="Dashboard" />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Próximos Agendamentos */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Próximos Agendamentos
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Agendamento
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{appointment.patient}</p>
                        <Badge
                          variant={appointment.status === "confirmado" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {appointment.time} • {appointment.doctor} • {appointment.type}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver detalhes
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-2" size="lg">
                <Plus className="h-4 w-4" />
                Novo Agendamento
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" size="lg">
                <UserPlus className="h-4 w-4" />
                Cadastrar Paciente
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" size="lg">
                <Calendar className="h-4 w-4" />
                Ver Agenda Completa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
