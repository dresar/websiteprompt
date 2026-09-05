import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Key } from 'lucide-react';

const AdminInfo: React.FC = () => {
  return (
    <Card className="w-full max-w-md mx-auto mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-blue-800">Default Admin User</CardTitle>
        <CardDescription className="text-blue-600">
          Gunakan kredensial berikut untuk login sebagai admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <User className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Username:</p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              admin
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Key className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Password:</p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              password
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <strong>Catatan:</strong> Ganti password default ini setelah login pertama untuk keamanan yang lebih baik.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInfo;