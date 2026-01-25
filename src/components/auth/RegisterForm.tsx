'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerUser } from '@/app/actions'; // We will create this
import { Loader2, CheckCircle } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  degree: z.enum(["Licenciatura", "Maestría", "Doctorado", "Especialidad"], {
    errorMap: () => ({ message: "Seleccione un grado académico" }),
  }),
  gender: z.enum(["Masculino", "Femenino", "Otro"], {
    errorMap: () => ({ message: "Seleccione un género" }),
  }),
  email: z.string().email("Email inválido"),
  confirmEmail: z.string().email("Email inválido"),
  phone: z.string().min(10, "El teléfono debe tener 10 dígitos"),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Los correos no coinciden",
  path: ["confirmEmail"],
});

type FormData = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; name: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data);
      if (result.success && result.data) {
        setSuccessData({ id: result.data.short_id, name: `${data.firstName} ${data.lastName}` });
      } else {
        alert("Error al registrar: " + result.error);
      }
    } catch (error) {
       alert("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 text-center animate-in fade-in zoom-in duration-300">
        <div className="h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-green-500/50 shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">¡Registro Exitoso!</h2>
        <p className="text-slate-200 mb-6">Tu identidad digital ha sido generada.</p>
        
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 w-full mb-6">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Tu ID de Acceso</p>
            <p className="text-4xl font-mono font-bold text-white tracking-widest">{successData.id}</p>
        </div>

        <p className="text-sm text-slate-300 mb-6">
            Guarda este ID. Lo necesitarás para ingresar al evento y registrar tu asistencia.
        </p>

        <Button onClick={() => window.location.reload()} variant="primary" className="w-full">
            Entendido
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full text-left">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Nombre</label>
            <Input {...register("firstName")} placeholder="Ej. Juan" />
            {errors.firstName && <p className="text-red-400 text-xs">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Apellido</label>
            <Input {...register("lastName")} placeholder="Ej. Pérez" />
            {errors.lastName && <p className="text-red-400 text-xs">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Grado Académico</label>
            <select {...register("degree")} className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-600">
                <option value="">Seleccionar...</option>
                <option value="Licenciatura">Licenciatura</option>
                <option value="Maestría">Maestría</option>
                <option value="Doctorado">Doctorado</option>
                <option value="Especialidad">Especialidad</option>
            </select>
            {errors.degree && <p className="text-red-400 text-xs">{errors.degree.message}</p>}
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Género</label>
            <select {...register("gender")} className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-600">
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
            </select>
            {errors.gender && <p className="text-red-400 text-xs">{errors.gender.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Email</label>
          <Input {...register("email")} type="email" placeholder="juan@ejemplo.com" />
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Confirmar Email</label>
          <Input {...register("confirmEmail")} type="email" placeholder="juan@ejemplo.com" />
          {errors.confirmEmail && <p className="text-red-400 text-xs">{errors.confirmEmail.message}</p>}
      </div>

      <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Teléfono</label>
          <Input {...register("phone")} type="tel" placeholder="55 1234 5678" />
          {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full mt-6" size="lg">
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</> : "Generar ID Digital"}
      </Button>
    </form>
  );
}
