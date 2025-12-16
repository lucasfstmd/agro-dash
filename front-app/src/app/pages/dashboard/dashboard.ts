import { Component } from '@angular/core';
import { StatsWidget } from './components/statswidget';
import { LeadsByMunicipalityWidget } from './components/leadsbymunicipalitywidget';
import { LeadsByStatusWidget } from './components/leadsbystatuswidget';
import { LeadsMapWidget } from './components/leadsmapwidget';
import { LeadsAreaChartWidget } from './components/leadsareachartwidget';

@Component({
    selector: 'app-dashboard',
    imports: [StatsWidget, LeadsByMunicipalityWidget, LeadsByStatusWidget, LeadsMapWidget, LeadsAreaChartWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-4">
                <app-leads-by-status-widget />
            </div>
            <div class="col-span-12 xl:col-span-4">
                <app-leads-by-municipality-widget />
            </div>
            <div class="col-span-12 xl:col-span-4">
                <app-leads-area-chart-widget />
            </div>
            <div class="col-span-12">
                <app-leads-map-widget />
            </div>
        </div>
    `
})
export class Dashboard { }
