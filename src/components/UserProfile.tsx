import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Camera, Edit3, Save, X, Eye, EyeOff, Shield } from 'lucide-react';
import { useFormValidation, createPasswordStrengthValidator, createUsernameValidator } from '@/hooks/useFormValidation';
import * as yup from 'yup';

interface UserProfileProps {
  user?: {
    id: number;
    username: string;
    email: string;
    profileImage?: string;
    createdAt: string;
  };
  onUpdateProfile?: (data: any) => Promise<void>;
}

const profileSchema = yup.object({
  username: createUsernameValidator(),
  currentPassword: yup.string().when('newPassword', {
    is: (val: string) => val && val.length > 0,
    then: (schema) => schema.required('Password saat ini diperlukan untuk mengubah password'),
    otherwise: (schema) => schema
  }),
  newPassword: createPasswordStrengthValidator().optional(),
  confirmPassword: yup.string().when('newPassword', {
    is: (val: string) => val && val.length > 0,
    then: (schema) => schema
      .required('Konfirmasi password diperlukan')
      .oneOf([yup.ref('newPassword')], 'Password tidak cocok'),
    otherwise: (schema) => schema
  })
});

export function UserProfile({ user, onUpdateProfile }: UserProfileProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: user?.profileImage || ''
  });

  const { validationState, validateAll, getValidationSummary } = useFormValidation(profileSchema);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    validateAll(newData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validasi file
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Error",
          description: "Ukuran file terlalu besar. Maksimal 5MB.",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "File harus berupa gambar.",
          variant: "destructive"
        });
        return;
      }

      // Convert to base64 untuk preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const summary = getValidationSummary();
    
    if (!summary.isValid) {
      toast({
        title: "Error Validasi",
        description: `Terdapat ${summary.errorCount} error yang perlu diperbaiki.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const updateData: any = {
        username: formData.username
      };

      // Hanya kirim password jika ada perubahan
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Hanya kirim gambar jika ada perubahan
      if (formData.profileImage !== user?.profileImage) {
        updateData.profileImage = formData.profileImage;
      }

      await onUpdateProfile?.(updateData);
      
      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui.",
      });
      
      setIsEditing(false);
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui profil. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      profileImage: user?.profileImage || ''
    });
    setIsEditing(false);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password: string): { level: number; text: string; color: string } => {
    if (!password) return { level: 0, text: 'Tidak ada', color: 'bg-gray-200' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    
    if (strength < 25) return { level: strength, text: 'Lemah', color: 'bg-red-500' };
    if (strength < 50) return { level: strength, text: 'Sedang', color: 'bg-yellow-500' };
    if (strength < 75) return { level: strength, text: 'Kuat', color: 'bg-blue-500' };
    return { level: strength, text: 'Sangat Kuat', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Pengguna
              </CardTitle>
              <CardDescription>
                Kelola informasi profil dan keamanan akun Anda
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profil
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.profileImage} alt={formData.username} />
                <AvatarFallback className="text-lg">
                  {formData.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{formData.username}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {user?.createdAt && (
                <p className="text-xs text-muted-foreground">
                  Bergabung sejak {new Date(user.createdAt).toLocaleDateString('id-ID')}
                </p>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <Separator />

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
                className={validationState.errors.username ? 'border-red-500' : ''}
              />
              {validationState.errors.username && (
                <p className="text-sm text-red-500">{validationState.errors.username}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email tidak dapat diubah. Hubungi support jika perlu mengubah email.
              </p>
            </div>

            {/* Password Section */}
            {isEditing && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <h4 className="font-medium">Ubah Password</h4>
                    <Badge variant="secondary" className="text-xs">Opsional</Badge>
                  </div>

                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        className={validationState.errors.currentPassword ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {validationState.errors.currentPassword && (
                      <p className="text-sm text-red-500">{validationState.errors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className={validationState.errors.newPassword ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {validationState.errors.newPassword && (
                      <p className="text-sm text-red-500">{validationState.errors.newPassword}</p>
                    )}
                    
                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Kekuatan Password:</span>
                          <span className={`font-medium ${
                            passwordStrength.level < 25 ? 'text-red-500' :
                            passwordStrength.level < 50 ? 'text-yellow-500' :
                            passwordStrength.level < 75 ? 'text-blue-500' : 'text-green-500'
                          }`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${passwordStrength.level}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={validationState.errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {validationState.errors.confirmPassword && (
                      <p className="text-sm text-red-500">{validationState.errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <>
              <Separator />
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !validationState.isValid}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UserProfile;