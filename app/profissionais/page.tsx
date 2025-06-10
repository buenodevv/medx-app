'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Mail, Phone, Calendar, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

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
  consultationPrice?: number
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
  consultationPrice: string
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
    consultationPrice: '',
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
      consultationPrice: profissional.consultationPrice?.toString() || '',
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
      consultationPrice: '',
      workingDays: []
    })
    setEditingProfissional(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProfissionals(searchTerm)
  }

  const toggleWorkingDay = (dayOfWeek: number) => {
    setFormData(prev => {
      const existingDayIndex = prev.workingDays.findIndex(day => day.dayOfWeek === dayOfWeek)
      
      if (existingDayIndex >= 0) {
        // Remove o dia se já existe
        return {
          ...prev,
          workingDays: prev.workingDays.filter((_, i) => i !== existingDayIndex)
        }
      } else {
        // Adiciona o dia se não existe
        return {
          ...prev,
          workingDays: [...prev.workingDays, { dayOfWeek, startTime: '08:00', endTime: '17:00' }]
        }
      }
    })
  }

  const updateWorkingDayTime = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.map(day => 
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    }))
  }

  const isDaySelected = (dayOfWeek: number) => {
    return formData.workingDays.some(day => day.dayOfWeek === dayOfWeek)
  }

  const getDayTimes = (dayOfWeek: number) => {
    return formData.workingDays.find(day => day.dayOfWeek === dayOfWeek) || { startTime: '08:00', endTime: '17:00' }
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
                    placeholder="Dr. João Silva"
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
                    placeholder="joao.silva@email.com"
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
                    placeholder="CRM/SP 123456"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    placeholder="Cardiologia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultationPrice">Valor da Consulta (R$)</Label>
                  <Input
                    id="consultationPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.consultationPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, consultationPrice: e.target.value }))}
                    placeholder="150.00"
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
                <Label className="text-base font-medium">Dias e Horários de Atendimento</Label>
                <div className="grid grid-cols-2 gap-3">
                  {DAYS_OF_WEEK.map(dayOption => {
                    const isSelected = isDaySelected(dayOption.value)
                    const dayTimes = getDayTimes(dayOption.value)
                    
                    return (
                      <div key={dayOption.value} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`day-${dayOption.value}`}
                            checked={isSelected}
                            onChange={() => toggleWorkingDay(dayOption.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <Label 
                            htmlFor={`day-${dayOption.value}`} 
                            className={`text-sm font-medium cursor-pointer ${
                              isSelected ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          >
                            {dayOption.label}
                          </Label>
                        </div>
                        
                        {isSelected && (
                          <div className="space-y-3 ml-7">
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">Horário de Início</Label>
                              <Input
                                type="time"
                                value={dayTimes.startTime}
                                onChange={(e) => updateWorkingDayTime(dayOption.value, 'startTime', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">Horário de Fim</Label>
                              <Input
                                type="time"
                                value={dayTimes.endTime}
                                onChange={(e) => updateWorkingDayTime(dayOption.value, 'endTime', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
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
