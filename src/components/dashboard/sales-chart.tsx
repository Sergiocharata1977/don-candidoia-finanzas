'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

interface SalesChartProps {
    data: { name: string; value: number }[];
}

const chartConfig = {
    value: {
        label: 'Ingresos',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;

export function SalesChart({ data }: SalesChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tendencia de Ingresos</CardTitle>
                <CardDescription>Ultimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="value" fill="var(--color-value)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    Mostrando total de ingresos por mes
                </div>
            </CardFooter>
        </Card>
    );
}
