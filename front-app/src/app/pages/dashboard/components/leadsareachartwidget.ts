import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { LeadService } from '../../service/lead.service';

@Component({
    standalone: true,
    selector: 'app-leads-area-chart-widget',
    imports: [CommonModule, ChartModule],
    template: `
        <div class="card flex flex-col justify-between h-full">
            <div class="flex justify-between items-center mb-4">
                <div class="font-semibold text-xl">Área por Cultivo</div>
                <div class="text-right">
                    <span class="block text-sm text-gray-500">Área Total</span>
                    <span class="text-xl font-bold text-primary">{{ totalArea().toFixed(2) }} ha</span>
                </div>
            </div>
            <div class="flex justify-center items-center flex-grow">
                <p-chart type="doughnut" [data]="chartData" [options]="chartOptions" class="w-full md:w-[20rem]" />
            </div>
        </div>
    `
})
export class LeadsAreaChartWidget implements OnInit {
    chartData: any;
    chartOptions: any;
    totalArea = signal<number>(0);

    constructor(private leadService: LeadService) {}

    ngOnInit() {
        this.initChartOptions();
        this.loadData();
    }

    initChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }

    async loadData() {
        const leads = await this.leadService.getLeads();
        
        const areaByCulture: Record<string, number> = {
            'Soja': 0,
            'Milho': 0,
            'Algodão': 0
        };

        let total = 0;

        leads.forEach(lead => {
            if (lead.properties) {
                lead.properties.forEach(prop => {
                    if (prop.culture && prop.area) {
                        const culture = prop.culture;
                        const area = Number(prop.area);
                        
                        if (areaByCulture[culture] !== undefined) {
                            areaByCulture[culture] += area;
                        } else {
                            // Fallback for other cultures if any
                            areaByCulture[culture] = (areaByCulture[culture] || 0) + area;
                        }
                        total += area;
                    }
                });
            }
        });

        this.totalArea.set(total);

        const documentStyle = getComputedStyle(document.documentElement);
        
        this.chartData = {
            labels: Object.keys(areaByCulture),
            datasets: [
                {
                    data: Object.values(areaByCulture).map(v => parseFloat(v.toFixed(2))),
                    backgroundColor: [
                        '#22c55e', // Soja - Green
                        '#eab308', // Milho - Yellow
                        '#ec4899'  // Algodão - Pink
                    ],
                    hoverBackgroundColor: [
                        '#16a34a',
                        '#ca8a04',
                        '#db2777'
                    ]
                }
            ]
        };
    }
}