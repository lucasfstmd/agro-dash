import { Component, EventEmitter, Input, OnDestroy, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import * as L from 'leaflet';
import 'leaflet-draw';

@Component({
    selector: 'app-map-drawer',
    standalone: true,
    imports: [CommonModule, ButtonModule, DrawerModule],
    encapsulation: ViewEncapsulation.None,
    template: `
    <p-drawer
      [(visible)]="visible"
      [fullScreen]="true"
      [modal]="true"
      [closable]="false"
      class="map-drawer"
      (onShow)="onDrawerOpen()"
    >
      <ng-template #header>
        <div class="flex items-center justify-between w-full px-4 py-2 border-b">
          <span class="text-xl font-bold">
            Definir Geometria da Propriedade
          </span>

          <div class="flex gap-2">
            <p-button
              label="Cancelar"
              icon="pi pi-times"
              severity="secondary"
              text
              (onClick)="cancel()"
            />
            <p-button
              label="Limpar"
              icon="pi pi-trash"
              severity="danger"
              outlined
              (onClick)="clearMap()"
            />
            <p-button
              label="Concluir"
              icon="pi pi-check"
              (onClick)="save()"
              [disabled]="!hasLayer"
            />
          </div>
        </div>
      </ng-template>

      <div class="flex items-center justify-center w-full h-full p-4">
        <div id="map" class="map-container shadow-2xl border-round-xl"></div>
      </div>
    </p-drawer>
  `,
    styles: [`

    .map-drawer .p-drawer-content {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .map-container {
      width: 90%;
      height: 80vh;
      border-radius: 12px;
      overflow: hidden;
    }
  `]
})
export class MapDrawerComponent implements OnDestroy {

    // ===== Inputs / Outputs =====
    @Input() visible = false;
    @Input() initialGeometry: { lat: number; lng: number }[] = [];

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() saveGeometry = new EventEmitter<{ lat: number; lng: number }[]>();
    @Output() cancelAction = new EventEmitter<void>();

    // ===== Leaflet =====
    private map?: L.Map;
    private drawnItems = new L.FeatureGroup();
    hasLayer = false;

    // ===== Lifecycle =====
    onDrawerOpen(): void {
        // Drawer opened, wait for animation to complete before initializing map
        setTimeout(() => this.initMap(), 400);
    }

    ngOnDestroy(): void {
        this.destroyMap();
    }

    // ===== Map =====
    private initMap(): void {
        if (this.map) {
            this.map.invalidateSize();
            return;
        }

        // Configurar os caminhos dos ícones do Leaflet
        const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
        const iconUrl = 'assets/leaflet/marker-icon.png';
        const shadowUrl = 'assets/leaflet/marker-shadow.png';
        L.Marker.prototype.options.icon = L.icon({
            iconRetinaUrl,
            iconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
        });

        this.map = L.map('map', {
            center: [-18.5122, -44.5550],
            zoom: 7
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        this.map.addLayer(this.drawnItems);

        this.loadInitialGeometry();
        this.addDrawControls();

        // Extra invalidation to ensure tiles render correctly
        setTimeout(() => {
            this.map?.invalidateSize();
        }, 100);
    }

    private destroyMap(): void {
        if (this.map) {
            this.map.remove();
            this.map = undefined;
        }
    }

    // ===== Geometry =====
    private loadInitialGeometry(): void {
        if (!this.initialGeometry || this.initialGeometry.length === 0) return;

        const polygon = L.polygon(this.initialGeometry);
        this.drawnItems.addLayer(polygon);

        if (this.drawnItems.getBounds().isValid()) {
            this.map?.fitBounds(this.drawnItems.getBounds());
        }

        this.hasLayer = true;
    }

    private addDrawControls(): void {
        const drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                    allowIntersection: true,
                    showArea: true
                },
                polyline: false,
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false
            },
            edit: {
                featureGroup: this.drawnItems,
                remove: true
            }
        });

        this.map?.addControl(drawControl);

        this.map?.on(L.Draw.Event.CREATED, (e: any) => {
            this.drawnItems.clearLayers();
            this.drawnItems.addLayer(e.layer);
            this.hasLayer = true;
        });

        this.map?.on(L.Draw.Event.DELETED, () => {
            this.hasLayer = this.drawnItems.getLayers().length > 0;
        });
    }

    // ===== Actions =====
    clearMap(): void {
        this.drawnItems.clearLayers();
        this.hasLayer = false;
    }

    save(): void {
        const layers = this.drawnItems.getLayers();
        if (layers.length > 0) {
            const layer = layers[0] as L.Polygon;
            const latlngs = layer.getLatLngs();
            // Leaflet retorna LatLng[][] para polígonos (anéis), pegamos o externo
            const outerRing = Array.isArray(latlngs[0]) ? latlngs[0] as L.LatLng[] : latlngs as L.LatLng[];

            this.saveGeometry.emit(outerRing.map(l => ({ lat: l.lat, lng: l.lng })));
        } else {
            this.saveGeometry.emit([]);
        }
        this.close();
    }

    cancel(): void {
        this.cancelAction.emit();
        this.close();
    }

    private close(): void {
        this.visible = false;
        this.visibleChange.emit(false);
        this.destroyMap();
    }
}
