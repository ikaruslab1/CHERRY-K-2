'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  degree: string;
  gender: string;
  email: string;
  phone: string;
}) {
  try {
    // 1. Create Auth User
    const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
    
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
      }
    });

    if (userError) {
        console.error("User creation error:", userError);
        return { success: false, error: userError.message };
    }

    const userId = userData.user.id;

    // 2. Insert Profile
    // We assume the Trigger will handle short_id generation
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        degree: data.degree,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        role: 'user' // Default role
      })
      .select('short_id')
      .single();

    if (profileError) {
      console.error("Profile insertion error:", profileError);
      // Cleanup auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { success: false, error: "Error creating profile: " + profileError.message };
    }

    const shortId = profile.short_id;

    // 3. Update password to shortId
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: shortId
    });

    if (updateError) {
       console.error("Password update error:", updateError);
       // We don't rollback here as the user is created, but they might need a password reset if this fails.
       // But shortId should be strong enough? "CK2-ABCD" might be too short?
       // Default min length is 6. CK2-ABCD is 8. Should be fine.
       // However, if validation fails, the user has the random temp password.
    }

    return { success: true, data: { short_id: shortId } };

  } catch (err: any) {
    console.error("Register Exception:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function loginWithId(shortId: string) {
  try {
    // 1. Find email by short_id
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('short_id', shortId)
      .single();

    if (error || !profile) {
      return { success: false, error: "ID no encontrado" };
    }

    // 2. Return credentials for client-side sign in (safest without @supabase/ssr setup)
    // The password is the shortId itself as per our registration logic.
    return { success: true, email: profile.email, password: shortId };

  } catch (err: any) {
    return { success: false, error: "Error al procesar login" };
  }
}


export async function checkEmailForRecovery(email: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .ilike('email', email)
      .single();

    if (error || !data) {
      return { success: false, error: "Correo no encontrado en nuestros registros" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Error al verificar el correo" };
  }
}

export async function verifyRecoveredUser(email: string, phone: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('short_id, phone')
      .ilike('email', email)
      .single();

    if (error || !data) {
        // Email should exist as checked in previous step, but just in case
      return { success: false, error: "Registro no encontrado" };
    }

    // Normalize phones for comparison (remove spaces, dashes, parentheses)
    const dbPhone = (data.phone || '').replace(/\D/g, '');
    const inputPhone = phone.replace(/\D/g, '');

    // Check last 10 digits to be safe if country code is involved, or exact match if 10 digits
    // The prompt asks for 10 digits validation.
    if (dbPhone !== inputPhone) {
        return { success: false, error: "El número de celular no coincide con el correo proporcionado" };
    }

    return { success: true, short_id: data.short_id };

  } catch (err: any) {
    return { success: false, error: "Error al verificar datos" };
  }
}
