import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadService } from '../../service/lead.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total de Leads</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ totalLeads }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-muted-color">Em todo o sistema</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Convertidos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ convertedLeads }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-muted-color">Leads com sucesso</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Prioritários</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ priorityLeads }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-star text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-muted-color">Área > 100 hectares</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Municípios</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ municipalities }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-muted-color">Regiões atendidas</span>
            </div>
        </div>`
})
export class StatsWidget implements OnInit {
    totalLeads = 0;
    convertedLeads = 0;
    priorityLeads = 0;
    municipalities = 0;

    constructor(private leadService: LeadService) { }

    ngOnInit() {
        this.leadService.getLeads().then(leads => {
            this.totalLeads = leads.length;
            this.convertedLeads = leads.filter(l => l.status === 'Convertido').length;
            this.priorityLeads = leads.filter(l => l.properties?.some(p => (p.area || 0) > 100)).length;
            this.municipalities = new Set(leads.map(l => l.municipality).filter(m => !!m)).size;
        });
    }
}
