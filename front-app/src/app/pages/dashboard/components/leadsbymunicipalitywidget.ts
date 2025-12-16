import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { LeadService } from '../../service/lead.service';

@Component({
    standalone: true,
    selector: 'app-leads-by-municipality-widget',
    imports: [ChartModule],
    template: `<div class="card">
        <div class="font-semibold text-xl mb-4">Leads por Município</div>
        <p-chart type="bar" [data]="chartData" [options]="chartOptions" />
    </div>`
})
export class LeadsByMunicipalityWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    constructor(public layoutService: LayoutService, private leadService: LeadService) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        this.leadService.getLeads().then(leads => {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
            const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

            const municipalityCounts: { [key: string]: number } = {};
            // ... (data processing logic remains same)
            leads.forEach(l => {
                if (l.municipality) {
                    municipalityCounts[l.municipality] = (municipalityCounts[l.municipality] || 0) + 1;
                }
            });

            const labels = Object.keys(municipalityCounts);
            const data = Object.values(municipalityCounts);

            this.chartData = {
                labels: labels,
                datasets: [
                    {
                        label: 'Leads',
                        backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                        borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                        data: data
                    }
                ]
            };

            this.chartOptions = {
                maintainAspectRatio: false,
                aspectRatio: 0.8,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                            font: {
                                weight: 500
                            }
                        },
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        }
                    }
                }
            };
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
