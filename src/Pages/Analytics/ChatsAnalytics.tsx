"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CategoriasChart from "./Charts/CategoriasChart";
import ProspectosEstadosChart from "./Charts/ProspectosEstadosChart";
import RetentionChart from "./Charts/RetentionChart";
import TiempoMedioVisitasChart from "./Charts/TiempoMedioVisitasChart";
import VentasPorZonaChart from "./Charts/VentasPorZonaChart";
import VisitasPorMesChart from "./Charts/VisitasPorMesChart";
import RendimientoVendedoresChart from "./Charts/RendimientoVendedoresChart ";
import GeneralSalesChart from "./Charts/GeneralSalesChart";

function ChartSkeleton() {
  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

function ChartWrapper({
  title,
  children,
  loading,
}: {
  title: string;
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? <ChartSkeleton /> : children}
      </CardContent>
    </Card>
  );
}

function ChatsAnalytics() {
  const [loading, setLoading] = useState(true);

  // Simular carga de datos
  setTimeout(() => setLoading(false), 2000);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h2 className="text-4xl font-bold tracking-tight mb-8">
        Análisis de datos
      </h2>
      <Tabs defaultValue="ventas" className="space-y-8">
        <TabsList className="mb-4">
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="visitas">Visitas</TabsTrigger>
          <TabsTrigger value="prospectos">Prospectos</TabsTrigger>
        </TabsList>
        <TabsContent value="ventas" className="space-y-8">
          <ChartWrapper title="Ventas Generales" loading={loading}>
            <GeneralSalesChart />
          </ChartWrapper>
          <ChartWrapper title="Ventas por Categoría" loading={loading}>
            <CategoriasChart />
          </ChartWrapper>
          <ChartWrapper title="Ventas por Zona" loading={loading}>
            <VentasPorZonaChart />
          </ChartWrapper>
          <ChartWrapper title="Rendimiento de Vendedores" loading={loading}>
            <RendimientoVendedoresChart />
          </ChartWrapper>
        </TabsContent>
        <TabsContent value="visitas" className="space-y-8">
          <ChartWrapper title="Visitas por Mes" loading={loading}>
            <VisitasPorMesChart />
          </ChartWrapper>
          <ChartWrapper title="Tiempo Medio de Visitas" loading={loading}>
            <TiempoMedioVisitasChart />
          </ChartWrapper>
        </TabsContent>
        <TabsContent value="prospectos" className="space-y-8">
          <ChartWrapper title="Estados de Prospectos" loading={loading}>
            <ProspectosEstadosChart />
          </ChartWrapper>
          <ChartWrapper title="Retención de Clientes" loading={loading}>
            <RetentionChart />
          </ChartWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ChatsAnalytics;
