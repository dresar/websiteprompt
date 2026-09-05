import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSimpleFormValidation } from '@/hooks/useSimpleFormValidation';
import { userService, jwtUtils } from '@/lib/mockDatabase';

interface RegisterFormProps {
  onRegisterSuccess: (user: any) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateForm
  } = useSimpleFormValidation({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  }, {
    username: (value) => {
      if (!value) return 'Username harus diisi';
      if (value.length < 3) return 'Username minimal 3 karakter';
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username hanya boleh berisi huruf, angka, dan underscore';
      return '';
    },
    email: (value) => {
      if (!value) return 'Email harus diisi';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Format email tidak valid';
      return '';
    },
    password: (value) => {
      if (!value) return 'Password harus diisi';
      if (value.length < 6) return 'Password minimal 6 karakter';
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password harus mengandung huruf besar, huruf kecil, dan angka';
      }
      return '';
    },
    confirmPassword: (value, allValues) => {
      if (!value) return 'Konfirmasi password harus diisi';
      if (value !== allValues.password) return 'Password tidak cocok';
      return '';
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input sebelum submit
    if (!values.username || !values.email || !values.password || !values.confirmPassword) {
      setError('Semua field harus diisi');
      return;
    }
    
    if (!validateForm()) {
      setError('Mohon perbaiki kesalahan pada form');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await userService.createUser(values.username, values.email, values.password);
      
      if (!user) {
        setError('Gagal membuat akun. Silakan coba lagi.');
        return;
      }

      // Generate token
      const token = jwtUtils.generateToken(user.id);
      
      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      onRegisterSuccess(user);
    } catch (error: any) {
      console.error('Register error:', error);
      setError(error.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Daftar</CardTitle>
        <CardDescription className="text-center">
          Buat akun baru untuk memulai
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Masukkan username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.username ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Masukkan email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Masukkan password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.password ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Konfirmasi password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.confirmPassword ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Sedang mendaftar...' : 'Daftar'}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              Sudah punya akun? Masuk di sini
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};