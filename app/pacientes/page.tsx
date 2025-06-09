'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type Patient = {
  id: string
  name: string
  cpf: string
  phone?: string
  email?: string
  address?: string
  status: 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'FINALIZADO'
  lastConsult?: string
  createdAt: string
  updatedAt: string
}

type PatientFormData = {
  name: string
  cpf: string
  phone: string
  email: string
  address: string
  status: 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'FINALIZADO'
  lastConsult: string
}

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    status: 'AGENDADO',
    lastConsult: ''
  })
  const { toast } = useToast()

  // Carregar pacientes ao montar o componente
  useEffect(() => {
    fetchPatients()
  }, [])

  // Função para obter as informações do badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return { label: 'Agendado', variant: 'default' as const }
      case 'CONFIRMADO':
        return { label: 'Confirmado', variant: 'ready' as const }
      case 'CANCELADO':
        return { label: 'Cancelado', variant: 'destructive' as const }
      case 'FINALIZADO':
        return { label: 'Finalizado', variant: 'secondary' as const }
      default:
        return { label: status, variant: 'outline' as const }
    }
  }

  // Buscar pacientes
  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patients?search=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      } else {
        toast({
          title: "Erro",
          description: "Erro ao carregar pacientes",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar pacientes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Criar ou atualizar paciente
  const handleSubmit = async () => {
    try {
      const url = editingPatient ? `/api/patients/${editingPatient.id}` : '/api/patients'
      const method = editingPatient ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          lastConsult: formData.lastConsult || null
        })
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: editingPatient ? "Paciente atualizado com sucesso" : "Paciente criado com sucesso"
        })
        setIsDialogOpen(false)
        setEditingPatient(null)
        setFormData({
          name: '',
          cpf: '',
          phone: '',
          email: '',
          address: '',
          status: 'AGENDADO',
          lastConsult: ''
        })
        fetchPatients()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Erro ao salvar paciente",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar paciente",
        variant: "destructive"
      })
    }
  }

  // Deletar paciente
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return
    
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Paciente excluído com sucesso"
        })
        fetchPatients()
      } else {
        toast({
          title: "Erro",
          description: "Erro ao excluir paciente",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir paciente",
        variant: "destructive"
      })
    }
  }

  // Abrir dialog para edição
  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name,
      cpf: patient.cpf,
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      status: patient.status,
      lastConsult: patient.lastConsult ? patient.lastConsult.split('T')[0] : ''
    })
    setIsDialogOpen(true)
  }

  // Carregar pacientes na inicialização e quando searchTerm mudar
  useEffect(() => {
    fetchPatients()
  }, [searchTerm])

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.phone && patient.phone.includes(searchTerm)) ||
    patient.cpf.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar pacientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingPatient(null)
                    setFormData({
                      name: '',
                      cpf: '',
                      phone: '',
                      email: '',
                      address: '',
                      status: 'AGENDADO',
                      lastConsult: ''
                    })
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Novo Paciente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPatient ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input 
                        id="name" 
                        placeholder="Nome do paciente"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input 
                        id="cpf" 
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Textarea 
                      id="address" 
                      placeholder="Endereço completo"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData({...formData, status: value as any})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AGENDADO">Agendado</SelectItem>
                          <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                          <SelectItem value="CANCELADO">Cancelado</SelectItem>
                          <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastConsult">Última Consulta</Label>
                      <Input 
                        id="lastConsult" 
                        type="date"
                        value={formData.lastConsult}
                        onChange={(e) => setFormData({...formData, lastConsult: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false)
                        setEditingPatient(null)
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingPatient ? 'Atualizar' : 'Salvar'} Paciente
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-8">
              Carregando pacientes...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Consulta</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => {
                  const statusInfo = getStatusBadge(patient.status)
                  return (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.cpf}</TableCell>
                      <TableCell>{patient.email || '-'}</TableCell>
                      <TableCell>{patient.phone || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {patient.address || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {patient.lastConsult 
                          ? new Date(patient.lastConsult).toLocaleDateString('pt-BR')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(patient)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(patient.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum paciente encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
