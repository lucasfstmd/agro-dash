import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { LeadService } from '../../service/lead.service';

@Component({
    standalone: true,
    selector: 'app-leads-by-status-widget',
    imports: [ChartModule],
    template: `<div class="card flex flex-col items-center">
        <div class="font-semibold text-xl mb-4">Leads por Status</div>
        <p-chart type="doughnut" [data]="chartData" [options]="chartOptions" />
    </div>`
})
export class LeadsByStatusWidget implements OnInit, OnDestroy {
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

            const statusCounts: { [key: string]: number } = {};
            leads.forEach(l => {
                const status = l.status || 'Desconhecido';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            const labels = Object.keys(statusCounts);
            const data = Object.values(statusCounts);

            // Assign colors dynamically or fixed
            const colors = [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--red-500'),
                documentStyle.getPropertyValue('--purple-500')
            ];
            const hoverColors = [
                documentStyle.getPropertyValue('--blue-400'),
                documentStyle.getPropertyValue('--yellow-400'),
                documentStyle.getPropertyValue('--green-400'),
                documentStyle.getPropertyValue('--red-400'),
                documentStyle.getPropertyValue('--purple-400')
            ];

            this.chartData = {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500')],
                        hoverBackgroundColor: [documentStyle.getPropertyValue('--p-indigo-400'), documentStyle.getPropertyValue('--p-purple-400'), documentStyle.getPropertyValue('--p-teal-400')]
                    }
                ]
            };

            this.chartOptions = {
                cutout: '60%',
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
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
