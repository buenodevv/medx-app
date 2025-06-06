"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, MoreHorizontal, Edit, Eye, UserX, Phone, Mail } from "lucide-react"

const patients = [
  {
    id: 1,
    name: "Maria Silva",
    cpf: "123.456.789-00",
    phone: "(11) 99999-9999",
    email: "maria@email.com",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-01-25",
    status: "ativo",
  },
  {
    id: 2,
    name: "João Santos",
    cpf: "987.654.321-00",
    phone: "(11) 88888-8888",
    email: "joao@email.com",
    lastVisit: "2024-01-10",
    nextAppointment: null,
    status: "ativo",
  },
  {
    id: 3,
    name: "Ana Costa",
    cpf: "456.789.123-00",
    phone: "(11) 77777-7777",
    email: "ana@email.com",
    lastVisit: "2023-12-20",
    nextAppointment: "2024-01-30",
    status: "inativo",
  },
]

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredPatients = patients.filter(
    (patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || patient.cpf.includes(searchTerm),
  )

  return (
    <div className="flex flex-col">
      <Header title="Pacientes" />

      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gerenciar Pacientes</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Paciente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" placeholder="Nome do paciente" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input id="cpf" placeholder="000.000.000-00" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" placeholder="(00) 00000-0000" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" placeholder="email@exemplo.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="birthdate">Data de Nascimento</Label>
                        <Input id="birthdate" type="date" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="gender">Sexo</Label>
                        <Input id="gender" placeholder="Masculino/Feminino" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input id="address" placeholder="Endereço completo" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsDialogOpen(false)}>Cadastrar Paciente</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Última Consulta</TableHead>
                  <TableHead>Próxima Consulta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell className="font-mono text-sm">{patient.cpf}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(patient.lastVisit).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      {patient.nextAppointment
                        ? new Date(patient.nextAppointment).toLocaleDateString("pt-BR")
                        : "Não agendado"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.status === "ativo" ? "default" : "secondary"}>{patient.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <UserX className="mr-2 h-4 w-4" />
                            Desativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum paciente encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
