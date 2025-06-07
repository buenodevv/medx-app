"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Clock, User } from "lucide-react"

const todayAppointments = [
  {
    id: 1,
    time: "09:00",
    patient: "Maria Silva",
    doctor: "Dr. Roberto",
    type: "Consulta",
    duration: "30min",
    status: "confirmado",
  },
  {
    id: 2,
    time: "10:30",
    patient: "João Santos",
    doctor: "Dra. Ana",
    type: "Retorno",
    duration: "20min",
    status: "pendente",
  },
  {
    id: 3,
    time: "14:00",
    patient: "Ana Costa",
    doctor: "Dr. Roberto",
    type: "Exame",
    duration: "45min",
    status: "confirmado",
  },
]

export default function AgendaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="flex flex-col">
      

      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendário */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Calendário</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="patient">Paciente</Label>
                      <Input id="patient" placeholder="Buscar ou cadastrar paciente..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="doctor">Profissional</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dr-roberto">Dr. Roberto Silva</SelectItem>
                          <SelectItem value="dra-ana">Dra. Ana Costa</SelectItem>
                          <SelectItem value="dr-carlos">Dr. Carlos Santos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="date">Data</Label>
                        <Input id="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="time">Horário</Label>
                        <Input id="time" type="time" defaultValue="09:00" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea id="notes" placeholder="Observações sobre o agendamento..." rows={3} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsDialogOpen(false)}>Salvar Agendamento</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>

          {/* Agendamentos do Dia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hoje - {new Date().toLocaleDateString("pt-BR")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{appointment.time}</span>
                      <Badge
                        variant={appointment.status === "confirmado" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{appointment.patient}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {appointment.doctor} • {appointment.type} • {appointment.duration}
                      </p>
                    </div>
                  </div>
                ))}

                {todayAppointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum agendamento para hoje</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
