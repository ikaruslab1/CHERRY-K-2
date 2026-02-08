"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerUser } from "@/actions/auth";
import { Loader2, CheckCircle } from "lucide-react";

// Helper for Title Case
const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const formSchema = z
  .object({
    firstName: z.string().min(1, "El nombre es obligatorio"),
    lastName: z
      .string()
      .min(1, "El apellido es obligatorio")
      .refine((val) => val.trim().split(/\s+/).length >= 2, {
        message: "Debe ingresar al menos dos apellidos (paterno y materno)",
      }),
    degree: z.enum(
      [
        "Licenciatura",
        "Maestría",
        "Doctorado",
        "Especialidad",
        "Estudiante",
        "Profesor",
      ],
      {
        message: "Seleccione un grado académico",
      }
    ),
    gender: z.enum(["Masculino", "Femenino", "Neutro"], {
      message: "Seleccione un género",
    }),
    email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
    confirmEmail: z
      .string()
      .min(1, "Confirme su email")
      .email("Email inválido"),
    phone: z
      .string()
      .min(1, "El teléfono es obligatorio")
      .regex(/^\d{10}$/, "El teléfono debe ser de 10 dígitos y sin lada"),
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
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("register_form_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        reset(parsed);
      } catch (e) {
        console.error("Error loading saved form data", e);
      }
    }
  }, [reset]);

  // Save to LocalStorage
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("register_form_data", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    // Auto-formatting to Title Case
    const formattedData = {
      ...data,
      firstName: toTitleCase(data.firstName),
      lastName: toTitleCase(data.lastName),
    };

    try {
      const result = await registerUser(formattedData);
      if (result.success && result.data) {
        localStorage.removeItem("register_form_data"); // Clear saved data
        setSuccessData({
          id: result.data.short_id,
          name: `${formattedData.firstName} ${formattedData.lastName}`,
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

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    field: "firstName" | "lastName",
    registerOnBlur: React.FocusEventHandler<HTMLInputElement>
  ) => {
    registerOnBlur(e);
    setValue(field, toTitleCase(e.target.value), { shouldValidate: true });
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

  // Extract register properties for manual onBlur handling
  const firstNameReg = register("firstName");
  const lastNameReg = register("lastName");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 w-full text-left"
    >
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#373737] ml-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <Input
            {...firstNameReg}
            onBlur={(e) =>
              handleBlur(e, "firstName", firstNameReg.onBlur)
            }
            placeholder="Ej. Juan"
            className={`rounded-xl border bg-gray-50 focus:bg-white transition-all h-12 ${
              errors.firstName ? "border-red-500 bg-red-50" : "border-gray-200"
            }`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs ml-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#373737] ml-1">
            Apellidos <span className="text-red-500">*</span>
          </label>
          <Input
            {...lastNameReg}
            onBlur={(e) =>
              handleBlur(e, "lastName", lastNameReg.onBlur)
            }
            placeholder="Ej. Pérez López"
            className={`rounded-xl border bg-gray-50 focus:bg-white transition-all h-12 ${
              errors.lastName ? "border-red-500 bg-red-50" : "border-gray-200"
            }`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs ml-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#373737] ml-1">
            Grado Académico <span className="text-red-500">*</span>
          </label>
          <select
            {...register("degree")}
            className={`flex h-12 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm text-[#373737] focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:bg-white transition-all ${
              errors.degree ? "border-red-500 bg-red-50" : "border-gray-200"
            }`}
          >
            <option value="">Seleccionar...</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="Especialidad">Especialidad</option>
            <option value="Maestría">Maestría</option>
            <option value="Doctorado">Doctorado</option>
            <option value="Profesor">Profesor</option>
          </select>
          {errors.degree && (
            <p className="text-red-500 text-xs ml-1">{errors.degree.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#373737] ml-1">
            Género <span className="text-red-500">*</span>
          </label>
          <select
            {...register("gender")}
            className={`flex h-12 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm text-[#373737] focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:bg-white transition-all ${
              errors.gender ? "border-red-500 bg-red-50" : "border-gray-200"
            }`}
          >
            <option value="">Seleccionar...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Neutro">Neutro</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-xs ml-1">{errors.gender.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[#373737] ml-1">
          Email <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("email")}
          type="email"
          placeholder="juan@ejemplo.com"
          className={`rounded-xl border bg-gray-50 focus:bg-white transition-all h-12 ${
            errors.email ? "border-red-500 bg-red-50" : "border-gray-200"
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[#373737] ml-1">
          Confirmar Email <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("confirmEmail")}
          type="email"
          placeholder="juan@example.com"
          className={`rounded-xl border bg-gray-50 focus:bg-white transition-all h-12 ${
            errors.confirmEmail
              ? "border-red-500 bg-red-50"
              : "border-gray-200"
          }`}
        />
        {errors.confirmEmail && (
          <p className="text-red-500 text-xs ml-1">
            {errors.confirmEmail.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[#373737] ml-1">
          Teléfono <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("phone")}
          type="tel"
          placeholder="Minimo 10 digitos. Sin lada."
          className={`rounded-xl border bg-gray-50 focus:bg-white transition-all h-12 ${
            errors.phone ? "border-red-500 bg-red-50" : "border-gray-200"
          }`}
        />
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

