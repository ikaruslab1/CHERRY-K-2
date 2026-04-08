"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerUser, loginWithId } from "@/actions/auth";
import { Loader2, CheckCircle } from "lucide-react";
import * as Icons from 'lucide-react';
import { useRouter } from "next/navigation";

// Helper for Title Case
const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const createFormSchema = (locale: string) => z
  .object({
    firstName: z.string().min(1, locale === 'en' ? "Name is required" : "El nombre es obligatorio"),
    lastName: z
      .string()
      .min(1, locale === 'en' ? "Last name is required" : "El apellido es obligatorio")
      .refine((val) => val.trim().split(/\s+/).length >= 2, {
        message: locale === 'en' ? "Please enter at least two last names" : "Debe ingresar al menos dos apellidos (paterno y materno)",
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
        message: locale === 'en' ? "Select an academic degree" : "Seleccione un grado académico",
      }
    ),
    gender: z.enum(["Masculino", "Femenino", "Neutro"], {
      message: locale === 'en' ? "Select a gender" : "Seleccione un género",
    }),
    email: z.string().min(1, locale === 'en' ? "Email is required" : "El email es obligatorio").email(locale === 'en' ? "Invalid email" : "Email inválido"),
    confirmEmail: z
      .string()
      .min(1, locale === 'en' ? "Confirm your email" : "Confirme su email")
      .email(locale === 'en' ? "Invalid email" : "Email inválido"),
    phone: z
      .string()
      .min(1, locale === 'en' ? "Phone is required" : "El teléfono es obligatorio")
      .regex(/^\d{10}$/, locale === 'en' ? "Phone must be 10 digits" : "El teléfono debe ser de 10 dígitos y sin lada"),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: locale === 'en' ? "Emails do not match" : "Los correos no coinciden",
    path: ["confirmEmail"],
  });

type FormData = z.infer<ReturnType<typeof createFormSchema>> & Record<string, any>;

interface RegisterFormProps {
  conferenceId?: string;
  isEmbedded?: boolean;
  customInputs?: any[];
  fieldsOrder?: string[];
  locale?: string;
}

export function RegisterForm({ conferenceId, isEmbedded, customInputs = [], fieldsOrder = [], locale = 'es' }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
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
    resolver: zodResolver(createFormSchema(locale)),
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

  const onSubmit = async (data: FormData, e?: React.BaseSyntheticEvent) => {
    setIsLoading(true);

    const customData: Record<string, any> = {};
    if (e?.target && customInputs && customInputs.length > 0) {
      const formData = new window.FormData(e.target);
      customInputs.forEach((input: any) => {
        const key = input.id;
        if (input.type === 'checkbox') {
          customData[input.label] = formData.get(key) === 'on';
        } else {
          customData[input.label] = formData.get(key);
        }
      });
    }

    // Auto-formatting to Title Case
    const formattedData = {
      ...data,
      firstName: toTitleCase(data.firstName),
      lastName: toTitleCase(data.lastName),
      conferenceId,
      customData,
    };

    try {
      const result = await registerUser(formattedData);
      if (result.success && result.data) {
        localStorage.removeItem("register_form_data"); // Clear saved data
        
        const shortId = result.data.short_id;
        const fullName = `${formattedData.firstName} ${formattedData.lastName}`;
        
        // Show success message briefly
        setSuccessData({
          id: shortId,
          name: fullName,
        });
        
        // Auto-login after a short delay
        setIsAutoLoggingIn(true);
        setTimeout(async () => {
          const loginResult = await loginWithId(shortId);
          
          if (loginResult.success) {
            if (isEmbedded) {
                // If embedded, stop spinning and show the button to continue manually
                setIsAutoLoggingIn(false);
            } else {
                window.location.href = '/profile';
            }
          } else {
            setIsAutoLoggingIn(false);
            console.error("Auto-login failed:", loginResult.error);
          }
        }, 2000); // 2 second delay to show success message
        
      } else {
        alert((locale === 'en' ? "Error registering: " : "Error al registrar: ") + result.error);
      }
    } catch (error) {
      alert(locale === 'en' ? "Connection error" : "Error de conexión");
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
          {locale === 'en' ? 'Registration Successful!' : '¡Registro Exitoso!'}
        </h2>
        <p className="text-gray-500 mb-6">
          {locale === 'en' ? 'Your digital identity has been generated.' : 'Tu identidad digital ha sido generada.'}
        </p>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 w-full mb-6">
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
            {locale === 'en' ? 'Your Access ID' : 'Tu ID de Acceso'}
          </p>
          <p className="text-4xl font-mono font-bold text-[#373737] tracking-widest">
            {successData.id}
          </p>
        </div>

        {isAutoLoggingIn ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#DBF227]" />
              <p className="text-sm text-gray-600 font-medium">
                {locale === 'en' ? 'Logging in automatically...' : 'Iniciando sesión automáticamente...'}
              </p>
            </div>
            <p className="text-xs text-gray-400">
              {locale === 'en' ? 'You will be redirected to your profile in a moment' : 'Serás redirigido a tu perfil en un momento'}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">
              {locale === 'en' 
                ? 'Save this ID. You will need it to enter the event and register your attendance.' 
                : 'Guarda este ID. Lo necesitarás para ingresar al evento y registrar tu asistencia.'
              }
            </p>

            <Button
              onClick={() => {
                  if (isEmbedded && window.top) {
                      window.top.location.href = window.location.origin + '/profile';
                  } else {
                      window.location.reload();
                  }
              }}
              variant="primary"
              className="w-full font-bold"
              size="lg"
            >
              {isEmbedded ? (locale === 'en' ? 'Go to platform' : 'Ir a la plataforma') : (locale === 'en' ? 'Got it' : 'Entendido')}
            </Button>
          </>
        )}
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
      <div className="space-y-5">
        {(() => {
          const defaultOrder = ['nombre', 'apellidos', 'grado', 'genero', 'email', 'confirmEmail', 'telefono'];
          const orderToUse = fieldsOrder && fieldsOrder.length > 0 ? fieldsOrder : [...defaultOrder, ...customInputs.map(ci => ci.id)];

          return orderToUse.map((fieldId) => {
            // Render fixed fields
            if (fieldId === 'nombre' || fieldId === 'apellidos') {
              if (fieldId === 'apellidos') return null; 

              return (
                <div key="name-grid" className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[#373737] ml-1">
                      {locale === 'en' ? 'First Name' : 'Nombre'} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...firstNameReg}
                      onBlur={(e) => handleBlur(e, "firstName", firstNameReg.onBlur)}
                      placeholder={locale === 'en' ? "Ex. John" : "Ej. Juan"}
                      className={`rounded-xl border transition-all h-12 text-black placeholder:text-gray-500 ${
                        errors.firstName ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
                      }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs ml-1">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[#373737] ml-1">
                      {locale === 'en' ? 'Last Names' : 'Apellidos'} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...lastNameReg}
                      onBlur={(e) => handleBlur(e, "lastName", lastNameReg.onBlur)}
                      placeholder={locale === 'en' ? "Ex. Smith Jones" : "Ej. Pérez López"}
                      className={`rounded-xl border transition-all h-12 text-black placeholder:text-gray-500 ${
                        errors.lastName ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
                      }`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs ml-1">{errors.lastName.message}</p>}
                  </div>
                </div>
              );
            }

            if (fieldId === 'grado') {
              return (
                <div key="grado" className="space-y-1.5">
                  <label className="text-sm font-bold text-[#373737] ml-1">
                    {locale === 'en' ? 'Academic Degree' : 'Grado Académico'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("degree")}
                    className={`w-full h-12 rounded-xl border transition-all px-3 text-black bg-white focus:border-black outline-none ${
                        errors.degree ? "border-red-500 bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <option value="">{locale === 'en' ? 'Select a degree' : 'Seleccione un grado'}</option>
                    <option value="Licenciatura">{locale === 'en' ? 'Bachelor\'s' : 'Licenciatura'}</option>
                    <option value="Maestría">{locale === 'en' ? 'Master\'s' : 'Maestría'}</option>
                    <option value="Doctorado">{locale === 'en' ? 'Doctorate' : 'Doctorado'}</option>
                    <option value="Especialidad">{locale === 'en' ? 'Specialty' : 'Especialidad'}</option>
                    <option value="Estudiante">{locale === 'en' ? 'Student' : 'Estudiante'}</option>
                    <option value="Profesor">{locale === 'en' ? 'Professor' : 'Profesor'}</option>
                  </select>
                  {errors.degree && <p className="text-red-500 text-xs ml-1">{errors.degree.message}</p>}
                </div>
              );
            }

            if (fieldId === 'genero') {
              return (
                <div key="genero" className="space-y-1.5">
                  <label className="text-sm font-bold text-[#373737] ml-1">
                    {locale === 'en' ? 'Gender' : 'Género'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("gender")}
                    className={`w-full h-12 rounded-xl border transition-all px-3 text-black bg-white focus:border-black outline-none ${
                        errors.gender ? "border-red-500 bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <option value="">{locale === 'en' ? 'Select a gender' : 'Seleccione un género'}</option>
                    <option value="Masculino">{locale === 'en' ? 'Male' : 'Masculino'}</option>
                    <option value="Femenino">{locale === 'en' ? 'Female' : 'Femenino'}</option>
                    <option value="Neutro">{locale === 'en' ? 'Neutral' : 'Neutro'}</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs ml-1">{errors.gender.message}</p>}
                </div>
              );
            }
            if (fieldId === 'email') {

              return (
                <div key="email" className="space-y-1.5">
                  <label className="text-sm font-bold text-[#373737] ml-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="juan@example.com"
                    className={`rounded-xl border h-12 text-black ${errors.email ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
                </div>
              );
            }

            if (fieldId === 'confirmEmail') {
              return (
                <div key="confirmEmail" className="space-y-1.5">
                  <label className="text-sm font-bold text-[#373737] ml-1">
                    {locale === 'en' ? 'Confirm Email' : 'Confirmar Email'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register("confirmEmail")}
                    type="email"
                    placeholder="juan@example.com"
                    className={`rounded-xl border h-12 text-black ${errors.confirmEmail ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"}`}
                  />
                  {errors.confirmEmail && <p className="text-red-500 text-xs ml-1">{errors.confirmEmail.message}</p>}
                </div>
              );
            }

            if (fieldId === 'telefono') {
              return (
                <div key="telefono" className="space-y-1.5">
                  <label className="text-sm font-bold text-[#373737] ml-1">
                    {locale === 'en' ? 'Phone' : 'Teléfono'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register("phone")}
                    type="tel"
                    placeholder={locale === 'en' ? "Minimum 10 digits" : "Minimo 10 digitos. Sin lada."}
                    className={`rounded-xl border h-12 text-black ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs ml-1">{errors.phone.message}</p>}
                </div>
              );
            }

            // Render custom fields
            const input = customInputs.find(ci => ci.id === fieldId);
            if (input) {
              return (
                <div key={input.id} className="space-y-1.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  {input.type !== "checkbox" && (
                    <label className="text-sm font-bold text-[#373737] ml-1">
                      {locale === 'en' && input.label_en ? input.label_en : input.label} {input.required && <span className="text-red-500">*</span>}
                    </label>
                  )}
                  {input.type === "text" && (
                    <Input 
                      name={input.id} 
                      placeholder={input.placeholder} 
                      className="h-12 border border-gray-200 rounded-xl bg-white focus:border-black text-black transition-all" 
                      required={input.required}
                      maxLength={50}
                    />
                  )}
                  {input.type === "number" && (
                    <Input 
                      name={input.id} 
                      type="text" 
                      placeholder={input.placeholder} 
                      className="h-12 border border-gray-200 rounded-xl bg-white focus:border-black text-black transition-all" 
                      required={input.required}
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '-', '(', ')', '+', '{', '}', ' '];
                        if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  )}
                  {input.type === "url" && (
                    <div className="space-y-1.5">
                      <Input 
                        name={input.id} 
                        type="url" 
                        placeholder={input.placeholder} 
                        className="h-12 border border-gray-200 rounded-xl bg-white focus:border-black text-black transition-all" 
                        required={input.required}
                        onBlur={(e) => {
                          const val = e.target.value;
                          const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
                          if (val && !urlPattern.test(val)) {
                            const p = e.target.parentElement?.querySelector('.url-error');
                            if (p) p.classList.remove('hidden');
                          } else {
                            const p = e.target.parentElement?.querySelector('.url-error');
                            if (p) p.classList.add('hidden');
                          }
                        }}
                      />
                      <p className="url-error hidden text-red-500 text-xs ml-1 font-bold animate-in fade-in slide-in-from-top-1 duration-200">
                        {locale === 'en' ? 'This is not a valid URL' : 'Esta no es una URL válida'}
                      </p>
                    </div>
                  )}
                  {input.type === "dropdown" && (
                    <select 
                      name={input.id} 
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-black focus:ring-0 transition-all text-black outline-none" 
                      required={input.required}
                    >
                      <option value="">{locale === 'en' ? 'Select...' : 'Seleccionar...'}</option>
                      {input.placeholder?.split(",").map((opt: string, i: number) => (
                        <option key={i} value={opt.trim()}>{opt.trim()}</option>
                      ))}
                    </select>
                  )}
                  {input.type === "checkbox" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 ml-1">
                        <input type="checkbox" name={input.id} className="h-5 w-5 rounded border-gray-300 text-black accent-black" required={input.required} />
                        <label className="text-sm font-bold text-[#373737]">
                           {locale === 'en' && input.label_en ? input.label_en : input.label} {input.required && <span className="text-red-500">*</span>}
                        </label>
                      </div>
                      {input.placeholder && (
                        <p className="text-[11px] text-gray-500 ml-8 leading-tight font-medium opacity-70">{input.placeholder}</p>
                      )}
                    </div>
                  )}
                  {input.banner_active && input.banner_text && (
                    <div className={`mt-2 p-3 rounded-xl text-xs font-semibold border flex flex-col sm:flex-row items-center sm:items-start gap-3 whitespace-normal break-words leading-relaxed ${
                      input.banner_color === "red" ? "bg-red-50 text-red-700 border-red-100" :
                      input.banner_color === "green" ? "bg-green-50 text-green-700 border-green-100" :
                      input.banner_color === "yellow" ? "bg-yellow-50 text-yellow-800 border-yellow-100" :
                      "bg-blue-50 text-blue-700 border-blue-100"
                    }`}>
                      <div className="shrink-0 pt-0.5">
                        <CheckCircle className={`w-4 h-4 ${
                          input.banner_color === "red" ? "text-red-400" :
                          input.banner_color === "green" ? "text-green-400" :
                          input.banner_color === "yellow" ? "text-yellow-500" :
                          "text-blue-400"
                        }`} />
                      </div>
                      <span className="flex-1 text-center sm:text-left">{input.banner_text}</span>
                    </div>
                  )}
                </div>
              );
            }

            return null;
          });
        })()}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 font-bold bg-[#373737] hover:bg-black text-white"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {locale === 'en' ? 'Registering...' : 'Registrando...'}
          </>
        ) : (
          locale === 'en' ? 'Generate Digital ID' : 'Generar ID Digital'
        )}
      </Button>
    </form>
  );
}
