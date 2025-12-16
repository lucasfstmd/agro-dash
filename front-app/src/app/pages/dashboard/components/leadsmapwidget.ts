import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { LeadService, Lead, Property } from '../../service/lead.service';
import * as L from 'leaflet';

@Component({
    standalone: true,
    selector: 'app-leads-map-widget',
    imports: [CommonModule, DialogModule, ButtonModule, SelectButtonModule, FormsModule],
    template: `
        <div class="card flex flex-col">
            <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div class="font-semibold text-xl">Mapa de Propriedades</div>
                <p-selectButton 
                    [options]="cultureOptions" 
                    [(ngModel)]="selectedCultures" 
                    (onChange)="updateMapLayers()" 
                    [multiple]="true" />
            </div>
            <div class="w-full h-[45rem] rounded-xl overflow-hidden relative">
                <div id="dashboard-map" class="w-full h-full"></div>
            </div>
        </div>

        <p-dialog header="Detalhes da Propriedade" [(visible)]="displayDialog" [modal]="true" [style]="{width: '400px'}" [draggable]="false" [resizable]="false">
            <div *ngIf="selectedLead && selectedProperty" class="flex flex-col gap-4">
                <div>
                    <span class="block text-sm text-gray-500">Lead</span>
                    <span class="text-lg font-bold">{{ selectedLead.name }}</span>
                </div>
                <div>
                    <span class="block text-sm text-gray-500">Município</span>
                    <span class="text-base">{{ selectedLead.municipality }}</span>
                </div>
                <div>
                    <span class="block text-sm text-gray-500">Cultura</span>
                    <span class="text-base">{{ selectedProperty.culture }}</span>
                </div>
                <div>
                    <span class="block text-sm text-gray-500">Área</span>
                    <span class="text-base">{{ selectedProperty.area }} ha</span>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Fechar" icon="pi pi-times" (click)="displayDialog = false" [text]="true" />
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep .leaflet-container {
            z-index: 0;
        }
    `]
})
export class LeadsMapWidget implements OnInit, OnDestroy {
    map: L.Map | undefined;
    displayDialog: boolean = false;
    selectedLead: Lead | undefined;
    selectedProperty: Property | undefined;
    
    // Filter State
    cultureOptions = [
        { label: 'Soja', value: 'Soja' },
        { label: 'Milho', value: 'Milho' },
        { label: 'Algodão', value: 'Algodão' }
    ];
    selectedCultures: string[] = ['Soja', 'Milho', 'Algodão'];
    
    private layers: L.Layer[] = [];
    private leadsData: Lead[] = [];

    constructor(private leadService: LeadService) { }

    ngOnInit() {
        // Delay map init slightly to ensure container is ready
        setTimeout(() => {
            this.initMap();
        }, 100);
    }

    initMap() {
        if (this.map) return;

        this.map = L.map('dashboard-map', {
            center: [-18.5122, -44.5550], // Minas Gerais
            zoom: 6
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        this.loadProperties();
    }

    loadProperties() {
        this.leadService.getLeads().then(leads => {
            this.leadsData = leads;
            this.updateMapLayers();
        });
    }

    updateMapLayers() {
        if (!this.map) return;

        // Clear existing layers
        this.layers.forEach(layer => this.map?.removeLayer(layer));
        this.layers = [];

        const bounds = L.latLngBounds([]);
        let hasLayers = false;

        this.leadsData.forEach(lead => {
            if (lead.properties) {
                lead.properties.forEach(prop => {
                    // Filter logic
                    if (prop.culture && !this.selectedCultures.includes(prop.culture)) {
                        return;
                    }

                    if (prop.geometry && prop.geometry.length > 0) {
                        const layer = L.polygon(prop.geometry, {
                            color: this.getColorForCulture(prop.culture || ''),
                            weight: 2,
                            opacity: 0.8,
                            fillOpacity: 0.35
                        });

                        layer.on('click', () => {
                            this.openDetails(lead, prop);
                        });

                        layer.addTo(this.map!);
                        this.layers.push(layer);
                        bounds.extend(layer.getBounds());
                        hasLayers = true;
                    }
                });
            }
        });

        if (hasLayers && this.map) {
            this.map.fitBounds(bounds);
        }
    }

    getColorForCulture(culture: string): string {
        switch (culture.toLowerCase()) {
            case 'soja': return '#22c55e'; // Green
            case 'milho': return '#eab308'; // Yellow
            case 'algodão': return '#ec4899'; // Pink/White(Cotton) -> Pink for visibility
            default: return '#3b82f6'; // Blue
        }
    }

    openDetails(lead: Lead, prop: Property) {
        this.selectedLead = lead;
        this.selectedProperty = prop;
        this.displayDialog = true;
    }

    ngOnDestroy() {
        if (this.map) {
            this.map.remove();
        }
    }
}
