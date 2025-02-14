"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Phone,
  PhoneCall,
  MapPin,
  Mail,
  Globe,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface Empresa {
  id?: number;
  nombre: string;
  telefono: string;
  pbx?: string;
  direccion: string;
  email: string;
  website?: string;
}

const EmpresaForm: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: "",
    telefono: "",
    pbx: "",
    direccion: "",
    email: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const fetchEmpresa = async () => {
    try {
      const response = await axios.get(`${API_URL}/empresa/verify-empresa`);
      if (response.status === 200) {
        setEmpresa(response.data);
      }
    } catch (error) {
      console.error("Error fetching empresa:", error);
      toast.error("No se pudo cargar la información de la empresa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresa();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmpresa((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.patch(
        `${API_URL}/empresa/update-empresa/${empresa.id}`,
        empresa
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Información actualizada");
        fetchEmpresa();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al actualizar");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Información de la Empresa</CardTitle>
          <CardDescription>
            Registre o actualice los datos de su empresa
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Empresa</Label>
              <div className="relative">
                <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre"
                  name="nombre"
                  value={empresa.nombre}
                  onChange={handleInputChange}
                  className="pl-8"
                  placeholder="Ingrese el nombre de la empresa"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefono"
                    name="telefono"
                    value={empresa.telefono}
                    onChange={handleInputChange}
                    className="pl-8"
                    placeholder="Teléfono principal"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pbx">PBX (opcional)</Label>
                <div className="relative">
                  <PhoneCall className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pbx"
                    name="pbx"
                    value={empresa.pbx}
                    onChange={handleInputChange}
                    className="pl-8"
                    placeholder="PBX"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="direccion"
                  name="direccion"
                  value={empresa.direccion}
                  onChange={handleInputChange}
                  className="pl-8"
                  placeholder="Dirección de la empresa"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={empresa.email}
                  onChange={handleInputChange}
                  className="pl-8"
                  placeholder="correo@empresa.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web (opcional)</Label>
              <div className="relative">
                <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  name="website"
                  value={empresa.website}
                  onChange={handleInputChange}
                  className="pl-8"
                  placeholder="www.empresa.com"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Guardar informacion
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EmpresaForm;
