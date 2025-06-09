'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Mail, Phone, Calendar, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

type WorkingDay = {
  dayOfWeek: number
  startTime: string
  endTime: string
}

type Profissional = {
  id: string
  name: string
  phone?: string
  email: string
  crm: string
  image?: string
  specialty?: string
  workingDays: WorkingDay[]
  createdAt: string
  updatedAt: string
}

type ProfissionalFormData = {
  name: string
  phone: string
  email: string
  crm: string
  image: string
  specialty: string
  workingDays: WorkingDay[]
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
]

export default function ProfissionaisPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [profissionals, setProfissionals] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null)
  const [formData, setFormData] = useState<ProfissionalFormData>({
    name: '',
    phone: '',
    email: '',
    crm: '',
    image: '',
    specialty: '',
    workingDays: []
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchProfissionals()
  }, [])

  const fetchProfissionals = async (search?: string) => {
    setLoading(true)
    try {
      const url = search 
        ? `/api/profissionals?search=${encodeURIComponent(search)}`
        : '/api/profissionals'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar profissionais')
      }
      
      const data = await response.json()
      setProfissionals(data)
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingProfissional 
        ? `/api/profissionals/${editingProfissional.id}`
        : '/api/profissionals'
      
      const method = editingProfissional ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar profissional')
      }

      toast({
        title: "Sucesso",
        description: editingProfissional 
          ? "Profissional atualizado com sucesso" 
          : "Profissional cadastrado com sucesso"
      })

      setIsDialogOpen(false)
      resetForm()
      fetchProfissionals()
    } catch (error: any) {
      console.error('Erro ao salvar profissional:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar profissional",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/profissionals/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir profissional')
      }

      toast({
        title: "Sucesso",
        description: "Profissional excluído com sucesso"
      })

      fetchProfissionals()
    } catch (error) {
      console.error('Erro ao excluir profissional:', error)
      toast({
        title: "Erro",
        description: "Erro ao excluir profissional",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (profissional: Profissional) => {
    setEditingProfissional(profissional)
    setFormData({
      name: profissional.name,
      phone: profissional.phone || '',
      email: profissional.email,
      crm: profissional.crm,
      image: profissional.image || '',
      specialty: profissional.specialty || '',
      workingDays: profissional.workingDays
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      crm: '',
      image: '',
      specialty: '',
      workingDays: []
    })
    setEditingProfissional(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProfissionals(searchTerm)
  }

  const addWorkingDay = () => {
    setFormData(prev => ({
      ...prev,
      workingDays: [...prev.workingDays, { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' }]
    }))
  }

  const removeWorkingDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.filter((_, i) => i !== index)
    }))
  }

  const updateWorkingDay = (index: number, field: keyof WorkingDay, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      )
    }))
  }

  const formatWorkingDays = (workingDays: WorkingDay[]) => {
    if (!workingDays.length) return 'Não definido'
    
    return workingDays
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      .map(day => {
        const dayName = DAYS_OF_WEEK.find(d => d.value === day.dayOfWeek)?.label || ''
        return `${dayName}: ${day.startTime} - ${day.endTime}`
      })
      .join(', ')
  }

  const filteredProfissionals = profissionals.filter(profissional =>
    profissional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profissional.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profissional.crm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profissional.specialty && profissional.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Profissionais</h2>
          <p className="text-muted-foreground">Gerencie os profissionais da sua clínica</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Adicionar Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM *</Label>
                  <Input
                    id="crm"
                    value={formData.crm}
                    onChange={(e) => setFormData(prev => ({ ...prev, crm: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">URL da Imagem</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Dias e Horários de Atendimento</Label>
                  <Button type="button" onClick={addWorkingDay} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Dia
                  </Button>
                </div>
                
                {formData.workingDays.map((day, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-end">
                    <div className="space-y-2">
                      <Label>Dia da Semana</Label>
                      <Select
                        value={day.dayOfWeek.toString()}
                        onValueChange={(value) => updateWorkingDay(index, 'dayOfWeek', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map(dayOption => (
                            <SelectItem key={dayOption.value} value={dayOption.value.toString()}>
                              {dayOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Início</Label>
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateWorkingDay(index, 'startTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fim</Label>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateWorkingDay(index, 'endTime', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeWorkingDay(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : editingProfissional ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Profissionais</CardTitle>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email, CRM ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button type="submit" size="sm">
                Buscar
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CRM</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Horários</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfissionals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Nenhum profissional encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfissionals.map((profissional) => (
                    <TableRow key={profissional.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {profissional.image ? (
                            <img
                              src={profissional.image}
                              alt={profissional.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {profissional.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {profissional.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {profissional.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{profissional.crm}</Badge>
                      </TableCell>
                      <TableCell>{profissional.specialty || '-'}</TableCell>
                      <TableCell>
                        {profissional.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {profissional.phone}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm" title={formatWorkingDays(profissional.workingDays)}>
                            {profissional.workingDays.length > 0 
                              ? `${profissional.workingDays.length} dia(s)` 
                              : 'Não definido'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(profissional)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(profissional.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
