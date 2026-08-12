"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerUser, loginWithCredentials, checkUsernameAvailability } from "@/actions/auth";
import { Loader2, CheckCircle, ArrowRight, ArrowLeft, Eye, EyeOff, UserCheck, KeyRound, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    username: z
      .string()
      .min(3, locale === 'en' ? "Username must be at least 3 characters" : "El usuario debe tener al menos 3 caracteres")
      .regex(/^[a-zA-Z0-9_.-]+$/, locale === 'en' ? "Only letters, numbers, dots, hyphens, and underscores" : "Solo letras, números, puntos, guiones y guiones bajos"),
    password: z
      .string()
      .min(8, locale === 'en' ? "Password must be at least 8 characters" : "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(1, locale === 'en' ? "Confirm your password" : "Confirme su contraseña"),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: locale === 'en' ? "Emails do not match" : "Los correos no coinciden",
    path: ["confirmEmail"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: locale === 'en' ? "Passwords do not match" : "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormData = z.infer<ReturnType<typeof createFormSchema>> & Record<string, any>;

interface RegisterFormProps {
  conferenceId?: string;
  isEmbedded?: boolean;
  customInputs?: any[];
  fieldsOrder?: string[];
  locale?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export function RegisterForm({ conferenceId, isEmbedded, customInputs = [], fieldsOrder = [], locale = 'es' }: RegisterFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ checking: boolean; available?: boolean; error?: string }>({ checking: false });

  const [successData, setSuccessData] = useState<{
    id: string;
    username: string;
    name: string;
    email: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createFormSchema(locale)),
    mode: "onTouched",
  });

  const usernameValue = watch("username");

  // Check username availability when typing in step 2
  useEffect(() => {
    if (!usernameValue || usernameValue.length < 3) {
      setUsernameStatus({ checking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true });
      const res = await checkUsernameAvailability(usernameValue);
      if (res.available) {
        setUsernameStatus({ checking: false, available: true });
      } else {
        setUsernameStatus({ checking: false, available: false, error: res.error });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [usernameValue]);

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

  // Handler to go to step 2 after validating step 1 fields
  const handleGoToStep2 = async () => {
    const isStep1Valid = await trigger([
      "firstName",
      "lastName",
      "degree",
      "gender",
      "email",
      "confirmEmail",
      "phone",
    ]);

    if (isStep1Valid) {
      setDirection(1);
      setStep(2);
    }
  };

  const handleGoToStep1 = () => {
    setDirection(-1);
    setStep(1);
  };

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

    // Auto-formatting to Title Case for names
    const formattedData = {
      ...data,
      firstName: toTitleCase(data.firstName),
      lastName: toTitleCase(data.lastName),
      username: data.username.trim().toLowerCase(),
      password: data.password,
      conferenceId,
      customData,
    };

    try {
      const result = await registerUser(formattedData);
      if (result.success && result.data) {
        localStorage.removeItem("register_form_data"); // Clear saved data

        const shortId = result.data.short_id;
        const assignedUsername = result.data.username;
        const fullName = `${formattedData.firstName} ${formattedData.lastName}`;
<<<<<<< HEAD
        
        // Show success screen
=======

        // Show success message briefly
>>>>>>> 04f5753faa187366369ad5317a4143825cd305ad
        setSuccessData({
          id: shortId,
          username: assignedUsername,
          name: fullName,
          email: formattedData.email,
        });
<<<<<<< HEAD
        
        // Auto-login after brief delay using credentials
=======

        // Auto-login after a short delay
>>>>>>> 04f5753faa187366369ad5317a4143825cd305ad
        setIsAutoLoggingIn(true);
        setTimeout(async () => {
          if (isEmbedded) {
            const loginUrl = `${window.location.origin}/login?user=${encodeURIComponent(assignedUsername)}`;
            if (window.top) {
              window.top.location.href = loginUrl;
            } else {
              window.location.href = loginUrl;
            }
          } else {
<<<<<<< HEAD
            const loginResult = await loginWithCredentials(assignedUsername, formattedData.password);
=======
            // --- FLUJO NORMAL: Server Action ---
            const loginResult = await loginWithId(shortId);

>>>>>>> 04f5753faa187366369ad5317a4143825cd305ad
            if (loginResult.success) {
              window.location.href = '/profile';
            } else {
              setIsAutoLoggingIn(false);
              console.error("Auto-login failed:", loginResult.error);
            }
          }
<<<<<<< HEAD
        }, 2000);
        
=======
        }, 2000); // 2 second delay to show success message

>>>>>>> 04f5753faa187366369ad5317a4143825cd305ad
      } else {
        alert((locale === 'en' ? "Error registering: " : "Error al registrar: ") + result.error);
        if (result.error?.toLowerCase().includes("usuario")) {
          setDirection(-1);
          setStep(2);
          setError("username", { message: result.error });
        }
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
          {locale === 'en' ? 'Your account and digital identity have been created.' : 'Tu cuenta e identidad digital han sido creadas.'}
        </p>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 w-full mb-6 space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {locale === 'en' ? 'Username' : 'Nombre de Usuario'}
            </p>
            <p className="text-xl font-bold text-blue-600 font-mono">
              @{successData.username}
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {locale === 'en' ? 'Your Access ID' : 'Tu ID de Acceso / Gafete'}
            </p>
            <p className="text-3xl font-mono font-bold text-[#373737] tracking-widest">
              {successData.id}
            </p>
          </div>
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
<<<<<<< HEAD
              {locale === 'en' 
                ? 'Save your username and password to log in in the future.' 
                : 'Guarda tu usuario y contraseña para futuros inicios de sesión.'
=======
              {locale === 'en'
                ? 'Save this ID. You will need it to enter the event and register your attendance.'
                : 'Guarda este ID. Lo necesitarás para ingresar al evento y registrar tu asistencia.'
>>>>>>> 04f5753faa187366369ad5317a4143825cd305ad
              }
            </p>

            <Button
              onClick={async () => {
                if (isEmbedded) {
<<<<<<< HEAD
                  const loginUrl = `${window.location.origin}/login?user=${encodeURIComponent(successData?.username || '')}`;
=======
                  // Redirigir a /login?code=ID en la ventana padre (mismo mecanismo que el auto-login)
                  const loginUrl = `${window.location.origin}/login?code=${encodeURIComponent(successData?.id || '')}`;
>>>>>>> 04f5753faa187366369ad5317a4143825cd305ad
                  if (window.top) {
                    window.top.location.href = loginUrl;
                  } else {
                    window.location.href = loginUrl;
                  }
                } else {
<<<<<<< HEAD
                  window.location.href = '/login';
=======
                  window.location.reload();
>>>>>>> 04f5753faa187366369ad5317a4143825cd305ad
                }
              }}
              variant="primary"
              className="w-full font-bold bg-[#373737] hover:bg-black text-white rounded-xl h-12"
              size="lg"
            >
              {locale === 'en' ? 'Go to Login' : 'Ir a Iniciar Sesión'}
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
<<<<<<< HEAD
    <div className="w-full overflow-hidden relative">
      {/* Progress Step Indicator */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step === 1 ? 'bg-[#373737] text-white' : 'bg-green-500 text-white'
          }`}>
            {step === 1 ? '1' : '✓'}
          </span>
          <span className="text-xs font-bold text-gray-700">
            {locale === 'en' ? 'Personal Details' : 'Datos Personales'}
          </span>
        </div>
        <div className="h-[2px] w-8 bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step === 2 ? 'bg-[#373737] text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'
          }`}>
            2
          </span>
          <span className="text-xs font-bold text-gray-700">
            {locale === 'en' ? 'Access Credentials' : 'Credenciales'}
          </span>
        </div>
=======
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
                      className={`rounded-xl border transition-all h-12 text-black placeholder:text-gray-500 ${errors.firstName ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
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
                      className={`rounded-xl border transition-all h-12 text-black placeholder:text-gray-500 ${errors.lastName ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
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
                    className={`w-full h-12 rounded-xl border transition-all px-3 text-black bg-white focus:border-black outline-none ${errors.degree ? "border-red-500 bg-red-50" : "border-gray-200"
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
                    className={`w-full h-12 rounded-xl border transition-all px-3 text-black bg-white focus:border-black outline-none ${errors.gender ? "border-red-500 bg-red-50" : "border-gray-200"
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
                    <div className={`mt-2 p-3 rounded-xl text-xs font-semibold border flex flex-col sm:flex-row items-center sm:items-start gap-3 whitespace-normal break-words leading-relaxed ${input.banner_color === "red" ? "bg-red-50 text-red-700 border-red-100" :
                        input.banner_color === "green" ? "bg-green-50 text-green-700 border-green-100" :
                          input.banner_color === "yellow" ? "bg-yellow-50 text-yellow-800 border-yellow-100" :
                            "bg-blue-50 text-blue-700 border-blue-100"
                      }`}>
                      <div className="shrink-0 pt-0.5">
                        <CheckCircle className={`w-4 h-4 ${input.banner_color === "red" ? "text-red-400" :
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
>>>>>>> 04f5753faa187366369ad5317a4143825cd305ad
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full text-left">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 ? (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="space-y-5"
            >
              {(() => {
                const defaultOrder = ['nombre', 'apellidos', 'grado', 'genero', 'email', 'confirmEmail', 'telefono'];
                const orderToUse = fieldsOrder && fieldsOrder.length > 0 ? fieldsOrder : [...defaultOrder, ...customInputs.map(ci => ci.id)];

                return orderToUse.map((fieldId) => {
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
                            className={`rounded-xl border transition-all h-12 text-black placeholder:text-gray-400 ${
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
                            className={`rounded-xl border transition-all h-12 text-black placeholder:text-gray-400 ${
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
                          placeholder={locale === 'en' ? "10 digits" : "Mínimo 10 dígitos sin lada"}
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
                      <div key={input.id} className="space-y-1.5">
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
                          />
                        )}
                        {input.type === "url" && (
                          <Input 
                            name={input.id} 
                            type="url" 
                            placeholder={input.placeholder} 
                            className="h-12 border border-gray-200 rounded-xl bg-white focus:border-black text-black transition-all" 
                            required={input.required}
                          />
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
                          <div className="flex items-center gap-2 ml-1">
                            <input type="checkbox" name={input.id} className="h-5 w-5 rounded border-gray-300 text-black accent-black" required={input.required} />
                            <label className="text-sm font-bold text-[#373737]">
                              {locale === 'en' && input.label_en ? input.label_en : input.label} {input.required && <span className="text-red-500">*</span>}
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                });
              })()}

              <Button
                type="button"
                onClick={handleGoToStep2}
                className="w-full mt-6 font-bold bg-[#373737] hover:bg-black text-white rounded-xl h-12 flex items-center justify-center gap-2"
                size="lg"
              >
                {locale === 'en' ? 'Continue to Account Setup' : 'Continuar a Credenciales'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="space-y-5"
            >
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {locale === 'en' 
                    ? 'Define your username and password. You will use these to log into your account.' 
                    : 'Define tu usuario y contraseña. Los utilizarás para iniciar sesión en tu cuenta.'
                  }
                </span>
              </div>

              {/* Username field */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#373737] ml-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-gray-500" />
                  {locale === 'en' ? 'Username' : 'Nombre de Usuario'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">@</span>
                  <Input
                    {...register("username", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
                      }
                    })}
                    placeholder="usuario123"
                    className={`rounded-xl border h-12 text-black pl-8 font-mono ${
                      errors.username ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
                    }`}
                  />
                  {usernameStatus.checking && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                  {!usernameStatus.checking && usernameStatus.available && (
                    <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {errors.username ? (
                  <p className="text-red-500 text-xs ml-1">{errors.username.message}</p>
                ) : usernameStatus.error ? (
                  <p className="text-red-500 text-xs ml-1">{usernameStatus.error}</p>
                ) : (
                  <p className="text-gray-400 text-[11px] ml-1">
                    {locale === 'en' ? 'Min 3 chars. Letters, numbers, dots, hyphens.' : 'Mín. 3 caracteres. Solo letras, números, puntos o guiones.'}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#373737] ml-1 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-gray-500" />
                  {locale === 'en' ? 'Password' : 'Contraseña'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`rounded-xl border h-12 text-black pr-10 ${
                      errors.password ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password field */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#373737] ml-1 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-gray-500" />
                  {locale === 'en' ? 'Confirm Password' : 'Confirmar Contraseña'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`rounded-xl border h-12 text-black pr-10 ${
                      errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs ml-1">{errors.confirmPassword.message}</p>}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleGoToStep1}
                  variant="outline"
                  className="w-1/3 rounded-xl h-12 border-gray-200 hover:bg-gray-100 flex items-center justify-center gap-1 font-bold text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {locale === 'en' ? 'Back' : 'Atrás'}
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading || usernameStatus.available === false}
                  className="w-2/3 font-bold bg-[#373737] hover:bg-black text-white rounded-xl h-12"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {locale === 'en' ? 'Creating...' : 'Creando...'}
                    </>
                  ) : (
                    locale === 'en' ? 'Create Account' : 'Crear Cuenta'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
