"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerUser } from "@/app/actions"; // We will create this
import { Loader2, CheckCircle } from "lucide-react";

const formSchema = z
  .object({
    firstName: z.string().min(2, "El nombre es requerido"),
    lastName: z.string().min(2, "El apellido es requerido"),
    degree: z.enum(["Licenciatura", "Maestría", "Doctorado", "Especialidad"], {
      message: "Seleccione un grado académico",
    }),
    gender: z.enum(["Masculino", "Femenino", "Otro"], {
      message: "Seleccione un género",
    }),
    email: z.string().email("Email inválido"),
    confirmEmail: z.string().email("Email inválido"),
    phone: z.string().min(10, "El teléfono debe tener 10 dígitos"),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Los correos no coinciden",
    path: ["confirmEmail"],
  });

type FormData = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    id: string;
    name: string;
  } | null>(null);

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
        setSuccessData({
          id: result.data.short_id,
          name: `${data.firstName} ${data.lastName}`,
        });
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
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-xl text-center animate-in fade-in zoom-in duration-300">
        <div className="h-20 w-20 bg-[#DBF227] rounded-full flex items-center justify-center mb-6 shadow-[#DBF227]/50 shadow-lg">
          <CheckCircle className="h-10 w-10 text-[#373737]" />
        </div>
        <h2 className="text-3xl font-bold text-[#373737] mb-2">
          ¡Registro Exitoso!
        </h2>
        <p className="text-gray-500 mb-6">
          Tu identidad digital ha sido generada.
        </p>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 w-full mb-6">
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
            Tu ID de Acceso
          </p>
          <p className="text-4xl font-mono font-bold text-[#373737] tracking-widest">
            {successData.id}
          </p>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          Guarda este ID. Lo necesitarás para ingresar al evento y registrar tu
          asistencia.
        </p>

        <Button
          onClick={() => window.location.reload()}
          variant="primary"
          className="w-full"
        >
          Entendido
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 w-full text-left"
    >
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#373737] ml-1">Nombre</label>
          <Input {...register("firstName")} placeholder="Ej. Juan" className="rounded-xl border-0 bg-gray-50 focus:bg-white transition-all h-12" />
          {errors.firstName && (
            <p className="text-red-500 text-xs ml-1">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#373737] ml-1">Apellido</label>
          <Input {...register("lastName")} placeholder="Ej. Pérez" className="rounded-xl border-0 bg-gray-50 focus:bg-white transition-all h-12" />
          {errors.lastName && (
            <p className="text-red-500 text-xs ml-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#373737] ml-1">
            Grado Académico
          </label>
          <select
            {...register("degree")}
            className="flex h-12 w-full rounded-xl border-0 bg-gray-50 px-3 py-2 text-sm text-[#373737] focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:bg-white transition-all"
          >
            <option value="">Seleccionar...</option>
            <option value="Especialidad">Especialidad</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="Maestría">Maestría</option>
            <option value="Doctorado">Doctorado</option>
          </select>
          {errors.degree && (
            <p className="text-red-500 text-xs ml-1">{errors.degree.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#373737] ml-1">Género</label>
          <select
            {...register("gender")}
            className="flex h-12 w-full rounded-xl border-0 bg-gray-50 px-3 py-2 text-sm text-[#373737] focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:bg-white transition-all"
          >
            <option value="">Seleccionar...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-xs ml-1">{errors.gender.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[#373737] ml-1">Email</label>
        <Input
          {...register("email")}
          type="email"
          placeholder="juan@ejemplo.com"
          className="rounded-xl border-0 bg-gray-50 focus:bg-white transition-all h-12"
        />
        {errors.email && (
          <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[#373737] ml-1">
          Confirmar Email
        </label>
        <Input
          {...register("confirmEmail")}
          type="email"
          placeholder="juan@ejemplo.com"
          className="rounded-xl border-0 bg-gray-50 focus:bg-white transition-all h-12"
        />
        {errors.confirmEmail && (
          <p className="text-red-500 text-xs ml-1">{errors.confirmEmail.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[#373737] ml-1">Teléfono</label>
        <Input {...register("phone")} type="tel" placeholder="55 1234 5678" className="rounded-xl border-0 bg-gray-50 focus:bg-white transition-all h-12" />
        {errors.phone && (
          <p className="text-red-500 text-xs ml-1">{errors.phone.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 font-bold"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...
          </>
        ) : (
          "Generar ID Digital"
        )}
      </Button>
    </form>
  );
}
