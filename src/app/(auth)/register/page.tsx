'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/firebase/auth';
import { OrganizationService } from '@/services/organization/OrganizationService';
import { UserService } from '@/services/auth/UserService';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await signUp(
        formData.email,
        formData.password,
        formData.displayName
      );

      const user = userCredential.user;

      // 2. Create user profile in Firestore
      await UserService.create(user.uid, {
        email: formData.email,
        displayName: formData.displayName,
      });

      // 3. Create organization if name provided
      if (formData.organizationName.trim()) {
        const org = await OrganizationService.create(
          formData.organizationName.trim(),
          user.uid,
          formData.email,
          formData.displayName
        );

        // Set as current organization
        await UserService.setCurrentOrganization(user.uid, org.id);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      // Log full error details for debugging
      if (err && typeof err === 'object') {
        console.error('Error code:', (err as any).code);
        console.error('Error message:', (err as any).message);
      }
      if (err instanceof Error) {
        const errorCode = (err as any).code || '';
        if (errorCode === 'auth/email-already-in-use' || err.message.includes('email-already-in-use')) {
          setError('Este email ya está registrado');
        } else if (errorCode === 'auth/weak-password' || err.message.includes('weak-password')) {
          setError('La contraseña es muy débil');
        } else if (errorCode === 'auth/invalid-email' || err.message.includes('invalid-email')) {
          setError('Email inválido');
        } else if (errorCode === 'auth/operation-not-allowed') {
          setError('Registro con email/contraseña no está habilitado. Habilita Email/Password en Firebase Console → Authentication → Sign-in method');
        } else if (errorCode === 'auth/configuration-not-found') {
          setError('Configuración de Firebase incorrecta. Verifica las credenciales en .env.local');
        } else {
          setError(`Error: ${errorCode || err.message}`);
        }
      } else {
        setError('Error al registrar. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Crear Cuenta</h1>
          <p className="text-slate-400 mt-2">Regístrate para comenzar</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Nombre completo
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="organizationName"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Nombre de la organización{' '}
                <span className="text-slate-500">(opcional)</span>
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Mi Empresa S.A."
              />
              <p className="text-xs text-slate-500 mt-1">
                Puedes crear una organización ahora o hacerlo más tarde
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-slate-400 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
