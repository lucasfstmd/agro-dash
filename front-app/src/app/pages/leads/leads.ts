import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { Lead, LeadFilter, LeadService, Property } from '../service/lead.service';
import { MapDrawerComponent } from './components/map-drawer';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
    selector: 'app-leads',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        MapDrawerComponent,
        InputMaskModule
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Novo Lead" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="leads()"
            [rows]="10"
            [loading]="loading()"
            [paginator]="true"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedLeads"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} leads"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <h5 class="m-0">Gerenciar Leads</h5>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <p-iconfield styleClass="w-full">
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" [(ngModel)]="filterName" (ngModelChange)="onSearchChange()" placeholder="Nome" class="w-full" />
                        </p-iconfield>
                        
                        <p-inputMask mask="999.999.999-99" [(ngModel)]="filterCpf" (ngModelChange)="onSearchChange()" placeholder="CPF" styleClass="w-full" />
                        
                        <p-select [(ngModel)]="filterMunicipality" [options]="municipalities" (onChange)="loadData()" placeholder="Município" [filter]="true" [showClear]="true" styleClass="w-full" />
                        
                        <p-select [(ngModel)]="filterStatus" [options]="statuses" (onChange)="loadData()" optionLabel="label" optionValue="value" placeholder="Status" [showClear]="true" styleClass="w-full" />
                    </div>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="name" style="min-width:16rem">
                        Nome
                        <p-sortIcon field="name" />
                    </th>
                    <th pSortableColumn="cpf" style="min-width:12rem">
                        CPF
                        <p-sortIcon field="cpf" />
                    </th>
                    <th pSortableColumn="municipality" style="min-width:12rem">
                        Município
                        <p-sortIcon field="municipality" />
                    </th>
                    <th pSortableColumn="status" style="min-width: 12rem">
                        Status
                        <p-sortIcon field="status" />
                    </th>
                    <th style="min-width: 8rem">Prioridade</th>
                    <th style="min-width: 12rem">Ações</th>
                </tr>
            </ng-template>
            <ng-template #body let-lead>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="lead" />
                    </td>
                    <td>{{ lead.name }}</td>
                    <td>{{ lead.cpf }}</td>
                    <td>{{ lead.municipality }}</td>
                    <td>
                        <p-tag [value]="lead.status" [severity]="getSeverity(lead.status)" />
                    </td>
                    <td class="text-center">
                        <i class="pi pi-star-fill text-yellow-500" *ngIf="isPriority(lead)" pTooltip="Área total > 100ha"></i>
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editLead(lead)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteLead(lead)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="leadDialog" [style]="{ width: 'auto' }" header="Detalhes do Lead" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="name" class="block font-bold mb-3">Nome</label>
                        <input type="text" pInputText id="name" [(ngModel)]="lead.name" required autofocus fluid [ngClass]="{'ng-invalid ng-dirty': submitted && !lead.name}" />
                        <small class="text-red-500" *ngIf="submitted && !lead.name">Nome é obrigatório.</small>
                    </div>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="cpf" class="block font-bold mb-3">CPF</label>
                            <p-inputMask id="cpf" mask="999.999.999-99" [(ngModel)]="lead.cpf" placeholder="000.000.000-00" [style]="{'width':'100%'}" [ngClass]="{'ng-invalid ng-dirty': submitted && (!lead.cpf || !isCpfValid(lead.cpf))}" />
                            <small class="text-red-500" *ngIf="submitted && !lead.cpf">CPF é obrigatório.</small>
                            <small class="text-red-500" *ngIf="submitted && lead.cpf && !isCpfValid(lead.cpf)">CPF inválido.</small>
                        </div>
                        <div class="col-span-6">
                             <label for="municipality" class="block font-bold mb-3">Município</label>
                             <p-select id="municipality" [(ngModel)]="lead.municipality" [options]="municipalities" placeholder="Selecione" [filter]="true" appendTo="body" fluid [ngClass]="{'ng-invalid ng-dirty': submitted && !lead.municipality}" />
                             <small class="text-red-500" *ngIf="submitted && !lead.municipality">Município é obrigatório.</small>
                        </div>
                    </div>

                    <div>
                        <label for="status" class="block font-bold mb-3">Status</label>
                        <p-select [(ngModel)]="lead.status" inputId="status" [options]="statuses" optionLabel="label" optionValue="value" placeholder="Selecione um Status" fluid [ngClass]="{'ng-invalid ng-dirty': submitted && !lead.status}" />
                        <small class="text-red-500" *ngIf="submitted && !lead.status">Status é obrigatório.</small>
                    </div>

                    <div>
                        <label for="comments" class="block font-bold mb-3">Comentários</label>
                        <textarea id="comments" pTextarea [(ngModel)]="lead.comments" rows="3" cols="20" fluid></textarea>
                    </div>

                    <div class="border-t pt-4" *ngIf="lead.id; else saveToProperties">
                        <div class="flex justify-between items-center mb-4">
                            <span class="block font-bold text-lg">Propriedades Rurais</span>
                            <p-button label="Adicionar Propriedade" icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addProperty()" [loading]="loadingProperties()" />
                        </div>

                        <div *ngFor="let prop of lead.properties; let i = index" class="p-3 border rounded mb-3 bg-gray-50 dark:bg-gray-800">
                             <div class="grid grid-cols-12 gap-4 items-end">
                                <div class="col-span-4">
                                    <label class="block text-sm mb-1">Município</label>
                                    <p-select [(ngModel)]="prop.municipality" [options]="municipalities" appendTo="body" placeholder="Selecione" [filter]="true" styleClass="w-full" />
                                </div>
                                <div class="col-span-3">
                                    <label class="block text-sm mb-1">Cultura</label>
                                    <p-select [(ngModel)]="prop.culture" [options]="cultures" appendTo="body" placeholder="Cultura" styleClass="w-full" />
                                </div>
                                <div class="col-span-2">
                                    <label class="block text-sm mb-1">Área (ha)</label>
                                    <p-inputnumber [(ngModel)]="prop.area" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="4" styleClass="w-full" />
                                </div>
                                <div class="col-span-3 flex gap-2 pb-1 justify-end">
                                    <p-button icon="pi pi-map" pTooltip="Definir no Mapa" tooltipPosition="top" [outlined]="true" severity="help" (onClick)="openMap(prop, i)" />
                                    <p-button icon="pi pi-check" pTooltip="Salvar Propriedade" tooltipPosition="top" [outlined]="true" severity="success" (onClick)="saveProperty(prop, i)" [loading]="loadingProperties()" />
                                    <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" (onClick)="deleteProperty(prop, i)" [loading]="loadingProperties()" />
                                </div>
                             </div>
                        </div>
                        <div *ngIf="!lead.properties || lead.properties.length === 0" class="text-center text-gray-500 py-4">
                            Nenhuma propriedade cadastrada.
                        </div>
                    </div>
                    <ng-template #saveToProperties>
                        <div class="text-center p-4 bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
                            <i class="pi pi-info-circle mr-2"></i> Salve o lead para gerenciar as propriedades.
                        </div>
                    </ng-template>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancelar" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Salvar" icon="pi pi-check" (click)="saveLead()" [loading]="saving()" [disabled]="!isLeadValid()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />

        <app-map-drawer
            [(visible)]="mapVisible"
            [initialGeometry]="currentGeometry"
            (saveGeometry)="onMapSaved($event)"
            (cancelAction)="onMapCancelled()">
        </app-map-drawer>
    `,
    providers: [MessageService, LeadService, ConfirmationService]
})
export class Leads implements OnInit {
    leadDialog: boolean = false;
    leads = signal<Lead[]>([]);
    lead!: Lead;
    selectedLeads!: Lead[] | null;
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    loadingProperties = signal<boolean>(false);
    submitted: boolean = false;
    statuses!: any[];
    cultures!: string[];
    municipalities!: string[];
    
    searchSubject = new Subject<void>();
    
    filterName: string = '';
    filterCpf: string = '';
    filterStatus: string | undefined;
    filterMunicipality: string | undefined;

    // Map State
    mapVisible: boolean = false;
    currentGeometry: { lat: number; lng: number }[] = [];
    activePropertyIndex: number = -1;

    @ViewChild('dt') dt!: Table;

    constructor(
        private leadService: LeadService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.loadData();
        this.statuses = [
            { label: 'Novo', value: 'Novo' },
            { label: 'Contato Inicial', value: 'Contato Inicial' },
            { label: 'Em Negociação', value: 'Em Negociação' },
            { label: 'Convertido', value: 'Convertido' },
            { label: 'Perdido', value: 'Perdido' }
        ];
        this.cultures = ['Soja', 'Milho', 'Algodão'];
        this.municipalities = [
            "Abadia dos Dourados", "Abaeté", "Abre Campo", "Acaiaca", "Açucena", "Água Boa", "Água Comprida", "Aguanil", "Águas Formosas", "Águas Vermelhas", "Aimorés", "Aiuruoca", "Alagoa", "Albertina", "Além Paraíba", "Alfenas", "Alfredo Vasconcelos", "Almenara", "Alpercata", "Alpinópolis", "Alterosa", "Alto Caparaó", "Alto Jequitibá", "Alto Rio Doce", "Alvarenga", "Alvinópolis", "Alvorada de Minas", "Amparo do Serra", "Andradas", "Andrelândia", "Angelândia", "Antônio Carlos", "Antônio Dias", "Antônio Prado de Minas", "Araçaí", "Aracitaba", "Araçuaí", "Araguari", "Arantina", "Araponga", "Araporã", "Arapuá", "Araújos", "Araxá", "Arceburgo", "Arcos", "Areado", "Argirita", "Aricanduva", "Arinos", "Astolfo Dutra", "Ataléia", "Augusto de Lima", "Baependi", "Baldim", "Bambuí", "Bandeira", "Bandeira do Sul", "Barão de Cocais", "Barão de Monte Alto", "Barbacena", "Barra Longa", "Barroso", "Bela Vista de Minas", "Belmiro Braga", "Belo Horizonte", "Belo Oriente", "Belo Vale", "Berilo", "Berizal", "Bertópolis", "Betim", "Bias Fortes", "Bicas", "Biquinhas", "Boa Esperança", "Bocaina de Minas", "Bocaiúva", "Bom Despacho", "Bom Jardim de Minas", "Bom Jesus da Penha", "Bom Jesus do Amparo", "Bom Jesus do Galho", "Bom Repouso", "Bom Sucesso", "Bonfim", "Bonfinópolis de Minas", "Bonito de Minas", "Borda da Mata", "Botelhos", "Botumirim", "Brás Pires", "Brasilândia de Minas", "Brasília de Minas", "Braúnas", "Brazópolis", "Brumadinho", "Bueno Brandão", "Buenópolis", "Bugre", "Buritis", "Buritizeiro", "Cabeceira Grande", "Cabo Verde", "Cachoeira da Prata", "Cachoeira de Minas", "Cachoeira de Pajeú", "Cachoeira Dourada", "Caetanópolis", "Caeté", "Caiana", "Cajuri", "Caldas", "Camacho", "Camanducaia", "Cambuí", "Cambuquira", "Campanário", "Campanha", "Campestre", "Campina Verde", "Campo Azul", "Campo Belo", "Campo do Meio", "Campo Florido", "Campos Altos", "Campos Gerais", "Cana Verde", "Canaã", "Canápolis", "Candeias", "Cantagalo", "Caparaó", "Capela Nova", "Capelinha", "Capetinga", "Capim Branco", "Capinópolis", "Capitão Andrade", "Capitão Enéas", "Capitólio", "Caputira", "Caraí", "Caranaíba", "Carandaí", "Carangola", "Caratinga", "Carbonita", "Careaçu", "Carlos Chagas", "Carmésia", "Carmo da Cachoeira", "Carmo da Mata", "Carmo de Minas", "Carmo do Cajuru", "Carmo do Paranaíba", "Carmo do Rio Claro", "Carmópolis de Minas", "Carneirinho", "Carrancas", "Carvalhópolis", "Carvalhos", "Casa Grande", "Cascalho Rico", "Cássia", "Cataguases", "Catas Altas", "Catas Altas da Noruega", "Catuji", "Catuti", "Caxambu", "Cedro do Abaeté", "Central de Minas", "Centralina", "Chácara", "Chalé", "Chapada do Norte", "Chapada Gaúcha", "Chiador", "Cipotânea", "Claraval", "Claro dos Poções", "Cláudio", "Coimbra", "Coluna", "Comendador Gomes", "Comercinho", "Conceição da Aparecida", "Conceição da Barra de Minas", "Conceição das Alagoas", "Conceição das Pedras", "Conceição de Ipanema", "Conceição do Mato Dentro", "Conceição do Pará", "Conceição do Rio Verde", "Conceição dos Ouros", "Cônego Marinho", "Confins", "Congonhal", "Congonhas", "Congonhas do Norte", "Conquista", "Conselheiro Lafaiete", "Conselheiro Pena", "Consolação", "Contagem", "Coqueiral", "Coração de Jesus", "Cordisburgo", "Cordislândia", "Corinto", "Coroaci", "Coromandel", "Coronel Fabriciano", "Coronel Murta", "Coronel Pacheco", "Coronel Xavier Chaves", "Córrego Danta", "Córrego do Bom Jesus", "Córrego Fundo", "Córrego Novo", "Couto de Magalhães de Minas", "Crisólita", "Cristais", "Cristália", "Cristiano Otoni", "Cristina", "Crucilândia", "Cruzeiro da Fortaleza", "Cruzília", "Cuparaque", "Curral de Dentro", "Curvelo", "Datas", "Delfim Moreira", "Delfinópolis", "Delta", "Descoberto", "Desterro de Entre Rios", "Desterro do Melo", "Diamantina", "Diogo de Vasconcelos", "Dionísio", "Divinésia", "Divino", "Divino das Laranjeiras", "Divinolândia de Minas", "Divinópolis", "Divisa Alegre", "Divisa Nova", "Divisópolis", "Dom Bosco", "Dom Cavati", "Dom Joaquim", "Dom Silvério", "Dom Viçoso", "Dona Euzébia", "Dores de Campos", "Dores de Guanhães", "Dores do Indaiá", "Dores do Turvo", "Doresópolis", "Douradoquara", "Durandé", "Elói Mendes", "Engenheiro Caldas", "Engenheiro Navarro", "Entre Folhas", "Entre Rios de Minas", "Ervália", "Esmeraldas", "Espera Feliz", "Espinosa", "Espírito Santo do Dourado", "Estiva", "Estrela Dalva", "Estrela do Indaiá", "Estrela do Sul", "Eugenópolis", "Ewbank da Câmara", "Extrema", "Fama", "Faria Lemos", "Felício dos Santos", "Felisburgo", "Felixlândia", "Fernandes Tourinho", "Ferros", "Fervedouro", "Florestal", "Formiga", "Formoso", "Fortaleza de Minas", "Fortuna de Minas", "Francisco Badaró", "Francisco Dumont", "Francisco Sá", "Franciscópolis", "Frei Gaspar", "Frei Inocêncio", "Frei Lagonegro", "Fronteira", "Fronteira dos Vales", "Fruta de Leite", "Frutal", "Funilândia", "Galiléia", "Gameleiras", "Glaucilândia", "Goiabeira", "Goianá", "Gonçalves", "Gonzaga", "Gouveia", "Governador Valadares", "Grão Mogol", "Grupiara", "Guanhães", "Guapé", "Guaraciaba", "Guaraciama", "Guaranésia", "Guarani", "Guarará", "Guarda-Mor", "Guaxupé", "Guidoval", "Guimarânia", "Guiricema", "Gurinhatã", "Heliodora", "Iapu", "Ibertioga", "Ibiá", "Ibiaí", "Ibiracatu", "Ibiraci", "Ibirité", "Ibitiúra de Minas", "Ibituruna", "Icaraí de Minas", "Igarapé", "Igaratinga", "Iguatama", "Ijaci", "Ilicínea", "Imbé de Minas", "Inconfidentes", "Indaiabira", "Indianópolis", "Ingaí", "Inhapim", "Inhaúma", "Inimutaba", "Ipaba", "Ipanema", "Ipatinga", "Ipiaçu", "Ipuiúna", "Iraí de Minas", "Itabira", "Itabirinha", "Itabirito", "Itacambira", "Itacarambi", "Itaguara", "Itaipé", "Itajubá", "Itamarandiba", "Itamarati de Minas", "Itambacuri", "Itambé do Mato Dentro", "Itamogi", "Itamonte", "Itanhandu", "Itanhomi", "Itaobim", "Itapagipe", "Itapecerica", "Itapeva", "Itatiaiuçu", "Itaú de Minas", "Itaúna", "Itaverava", "Itinga", "Itueta", "Ituiutaba", "Itumirim", "Iturama", "Itutinga", "Jaboticatubas", "Jacinto", "Jacuí", "Jacutinga", "Jaguaraçu", "Jaíba", "Jampruca", "Janaúba", "Januária", "Japaraíba", "Japonvar", "Jeceaba", "Jenipapo de Minas", "Jequeri", "Jequitaí", "Jequitibá", "Jequitinhonha", "Jesuânia", "Joaíma", "Joanésia", "João Monlevade", "João Pinheiro", "Joaquim Felício", "Jordânia", "José Gonçalves de Minas", "José Raydan", "Josenópolis", "Juatuba", "Juiz de Fora", "Juramento", "Juruaia", "Juvenília", "Ladainha", "Lagamar", "Lagoa da Prata", "Lagoa dos Patos", "Lagoa Dourada", "Lagoa Formosa", "Lagoa Grande", "Lagoa Santa", "Lajinha", "Lambari", "Lamim", "Laranjal", "Lassance", "Lavras", "Leandro Ferreira", "Leme do Prado", "Leopoldina", "Liberdade", "Lima Duarte", "Limeira do Oeste", "Lontra", "Luisburgo", "Luislândia", "Luminárias", "Luz", "Machacalis", "Machado", "Madre de Deus de Minas", "Malacacheta", "Mamonas", "Manga", "Manhuaçu", "Manhumirim", "Mantena", "Mar de Espanha", "Maravilhas", "Maria da Fé", "Mariana", "Marilac", "Mário Campos", "Maripá de Minas", "Marliéria", "Marmelópolis", "Martinho Campos", "Martins Soares", "Mata Verde", "Materlândia", "Mateus Leme", "Mathias Lobato", "Matias Barbosa", "Matias Cardoso", "Matipó", "Mato Verde", "Matozinhos", "Matutina", "Medeiros", "Medina", "Mendes Pimentel", "Mercês", "Mesquita", "Minas Novas", "Minduri", "Mirabela", "Miradouro", "Miraí", "Miravânia", "Moeda", "Moema", "Monjolos", "Monsenhor Paulo", "Montalvânia", "Monte Alegre de Minas", "Monte Azul", "Monte Belo", "Monte Carmelo", "Monte Formoso", "Monte Santo de Minas", "Monte Sião", "Montes Claros", "Montezuma", "Morada Nova de Minas", "Morro da Garça", "Morro do Pilar", "Munhoz", "Muriaé", "Mutum", "Muzambinho", "Nacip Raydan", "Nanuque", "Naque", "Natalândia", "Natércia", "Nazareno", "Nepomuceno", "Ninheira", "Nova Belém", "Nova Era", "Nova Lima", "Nova Módica", "Nova Ponte", "Nova Porteirinha", "Nova Resende", "Nova Serrana", "Nova União", "Novo Cruzeiro", "Novo Oriente de Minas", "Novorizonte", "Olaria", "Olhos-d'Água", "Olímpio Noronha", "Oliveira", "Oliveira Fortes", "Onça de Pitangui", "Oratórios", "Orizânia", "Ouro Branco", "Ouro Fino", "Ouro Preto", "Ouro Verde de Minas", "Padre Carvalho", "Padre Paraíso", "Pai Pedro", "Paineiras", "Pains", "Paiva", "Palma", "Palmópolis", "Papagaios", "Pará de Minas", "Paracatu", "Paraguaçu", "Paraisópolis", "Paraopeba", "Passa Quatro", "Passa Tempo", "Passa Vinte", "Passabém", "Passos", "Patis", "Patos de Minas", "Patrocínio", "Patrocínio do Muriaé", "Paula Cândido", "Paulistas", "Pavão", "Peçanha", "Pedra Azul", "Pedra Bonita", "Pedra do Anta", "Pedra do Indaiá", "Pedra Dourada", "Pedralva", "Pedras de Maria da Cruz", "Pedrinópolis", "Pedro Leopoldo", "Pedro Teixeira", "Pequeri", "Pequi", "Perdigão", "Perdizes", "Perdões", "Periquito", "Pescador", "Piau", "Piedade de Caratinga", "Piedade de Ponte Nova", "Piedade do Rio Grande", "Piedade dos Gerais", "Pimenta", "Pingo-d'Água", "Pintópolis", "Piracema", "Pirajuba", "Piranga", "Piranguçu", "Piranguinho", "Pirapetinga", "Pirapora", "Piraúba", "Pitangui", "Piumhi", "Planura", "Poço Fundo", "Poços de Caldas", "Pocrane", "Pompéu", "Ponte Nova", "Ponto Chique", "Ponto dos Volantes", "Porteirinha", "Porto Firme", "Poté", "Pouso Alegre", "Pouso Alto", "Prados", "Prata", "Pratápolis", "Pratinha", "Presidente Bernardes", "Presidente Juscelino", "Presidente Kubitschek", "Presidente Olegário", "Prudente de Morais", "Quartel Geral", "Queluzito", "Raposos", "Raul Soares", "Recreio", "Reduto", "Resende Costa", "Resplendor", "Ressaquinha", "Riachinho", "Riacho dos Machados", "Ribeirão das Neves", "Ribeirão Vermelho", "Rio Acima", "Rio Casca", "Rio do Prado", "Rio Doce", "Rio Espera", "Rio Manso", "Rio Novo", "Rio Paranaíba", "Rio Pardo de Minas", "Rio Piracicaba", "Rio Pomba", "Rio Preto", "Rio Vermelho", "Ritápolis", "Rochedo de Minas", "Rodeiro", "Romaria", "Rosário da Limeira", "Rubelita", "Rubim", "Sabará", "Sabinópolis", "Sacramento", "Salinas", "Salto da Divisa", "Santa Bárbara", "Santa Bárbara do Leste", "Santa Bárbara do Monte Verde", "Santa Bárbara do Tugúrio", "Santa Cruz de Minas", "Santa Cruz de Salinas", "Santa Cruz do Escalvado", "Santa Efigênia de Minas", "Santa Fé de Minas", "Santa Helena de Minas", "Santa Juliana", "Santa Luzia", "Santa Margarida", "Santa Maria de Itabira", "Santa Maria do Salto", "Santa Maria do Suaçuí", "Santa Rita de Caldas", "Santa Rita de Ibitipoca", "Santa Rita de Jacutinga", "Santa Rita de Minas", "Santa Rita do Itueto", "Santa Rita do Sapucaí", "Santa Rosa da Serra", "Santa Vitória", "Santana da Vargem", "Santana de Cataguases", "Santana de Pirapama", "Santana do Deserto", "Santana do Garambéu", "Santana do Jacaré", "Santana do Manhuaçu", "Santana do Paraíso", "Santana do Riacho", "Santana dos Montes", "Santo Antônio do Amparo", "Santo Antônio do Aventureiro", "Santo Antônio do Grama", "Santo Antônio do Itambé", "Santo Antônio do Jacinto", "Santo Antônio do Monte", "Santo Antônio do Retiro", "Santo Antônio do Rio Abaixo", "Santo Hipólito", "Santos Dumont", "São Bento Abade", "São Brás do Suaçuí", "São Domingos das Dores", "São Domingos do Prata", "São Félix de Minas", "São Francisco", "São Francisco de Paula", "São Francisco de Sales", "São Francisco do Glória", "São Geraldo", "São Geraldo da Piedade", "São Geraldo do Baixio", "São Gonçalo do Abaeté", "São Gonçalo do Pará", "São Gonçalo do Rio Abaixo", "São Gonçalo do Rio Preto", "São Gonçalo do Sapucaí", "São Gotardo", "São João Batista do Glória", "São João da Lagoa", "São João da Mata", "São João da Ponte", "São João das Missões", "São João del Rei", "São João do Manhuaçu", "São João do Manteninha", "São João do Oriente", "São João do Pacuí", "São João do Paraíso", "São João Evangelista", "São João Nepomuceno", "São Joaquim de Bicas", "São José da Barra", "São José da Lapa", "São José da Safira", "São José da Varginha", "São José do Alegre", "São José do Divino", "São José do Goiabal", "São José do Jacuri", "São José do Mantimento", "São Lourenço", "São Miguel do Anta", "São Pedro da União", "São Pedro do Suaçuí", "São Pedro dos Ferros", "São Romão", "São Roque de Minas", "São Sebastião da Bela Vista", "São Sebastião da Vargem Alegre", "São Sebastião do Anta", "São Sebastião do Maranhão", "São Sebastião do Oeste", "São Sebastião do Paraíso", "São Sebastião do Rio Preto", "São Sebastião do Rio Verde", "São Tiago", "São Tomás de Aquino", "São Tomé das Letras", "São Vicente de Minas", "Sapucaí-Mirim", "Sardoá", "Sarzedo", "Sem-Peixe", "Senador Amaral", "Senador Cortes", "Senador Firmino", "Senador José Bento", "Senador Modestino Gonçalves", "Senhora de Oliveira", "Senhora do Porto", "Senhora dos Remédios", "Sericita", "Seritinga", "Serra Azul de Minas", "Serra da Saudade", "Serra do Salitre", "Serra dos Aimorés", "Serrania", "Serranópolis de Minas", "Serranos", "Serro", "Sete Lagoas", "Setubinha", "Silveirânia", "Silvianópolis", "Simão Pereira", "Simonésia", "Sobrália", "Soledade de Minas", "Tabuleiro", "Taiobeiras", "Taparuba", "Tapira", "Tapiraí", "Taquaraçu de Minas", "Tarumirim", "Teixeiras", "Teófilo Otoni", "Timóteo", "Tiradentes", "Tiros", "Tocantins", "Tocos do Moji", "Toledo", "Tombos", "Três Corações", "Três Marias", "Três Pontas", "Tumiritinga", "Tupaciguara", "Turmalina", "Turvolândia", "Ubá", "Ubaí", "Ubaporanga", "Uberaba", "Uberlândia", "Umburatiba", "Unaí", "União de Minas", "Uruana de Minas", "Urucânia", "Urucuia", "Vargem Alegre", "Vargem Bonita", "Vargem Grande do Rio Pardo", "Varginha", "Varjão de Minas", "Várzea da Palma", "Varzelândia", "Vazante", "Verdelândia", "Veredinha", "Veríssimo", "Vermelho Novo", "Vespasiano", "Viçosa", "Vieiras", "Virgem da Lapa", "Virgínia", "Virginópolis", "Virgolândia", "Visconde do Rio Branco", "Volta Grande", "Wenceslau Braz"
        ];
        
        this.searchSubject.pipe(
            debounceTime(1000),
            distinctUntilChanged()
        ).subscribe(() => {
            this.loadData();
        });
    }

    async loadData() {
        this.loading.set(true);
        try {
            const filter: LeadFilter = {
                name: this.filterName,
                cpf: this.filterCpf,
                status: this.filterStatus || undefined,
                municipality: this.filterMunicipality || undefined
            };
            const data = await this.leadService.getLeads(filter);
            this.leads.set(data);
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar leads' });
        } finally {
            this.loading.set(false);
        }
    }

    onSearchChange() {
        this.searchSubject.next();
    }

    openNew() {
        this.lead = { properties: [] };
        this.submitted = false;
        this.leadDialog = true;
    }

    async editLead(lead: Lead) {
        // Clone deep to avoid reference issues with nested properties
        this.lead = JSON.parse(JSON.stringify(lead));
        if (this.lead.id) {
            await this.loadProperties(this.lead.id);
        }
        if (!this.lead.properties) {
            this.lead.properties = [];
        }
        this.leadDialog = true;
    }

    deleteLead(lead: Lead) {
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja excluir ' + lead.name + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loading.set(true);
                this.leadService.deleteLead(lead.id!).then(async () => {
                    await this.loadData(); // Refresh list
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Lead excluído',
                        life: 3000
                    });
                }).catch(() => {
                    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir lead' });
                    this.loading.set(false);
                });
            }
        });
    }

    hideDialog() {
        this.leadDialog = false;
        this.submitted = false;
    }

    async loadProperties(leadId: string) {
        this.loadingProperties.set(true);
        try {
            this.lead.properties = await this.leadService.getProperties(leadId);
        } catch (e) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar propriedades' });
        } finally {
            this.loadingProperties.set(false);
        }
    }

    isLeadValid(): boolean {
        return !!(
            this.lead.name?.trim() &&
            this.lead.cpf &&
            this.isCpfValid(this.lead.cpf) &&
            this.lead.municipality &&
            this.lead.status
        );
    }

    async saveLead() {
        this.submitted = true;

        if (this.isLeadValid()) {
            this.saving.set(true);
            try {
                // 1. Salvar Lead
                const savedLead = await this.leadService.saveLead(this.lead);
                
                // Atualizar ID localmente para garantir que as propriedades tenham referência
                if (!this.lead.id) {
                    this.lead.id = savedLead.id;
                }

                // 2. Salvar Propriedades
                if (this.lead.properties && this.lead.properties.length > 0) {
                    const propPromises = this.lead.properties.map(prop => {
                        if (!prop.leadId) prop.leadId = this.lead.id;
                        return this.leadService.saveProperty(prop);
                    });
                    await Promise.all(propPromises);
                }

                await this.loadData();
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Lead e propriedades salvos com sucesso' });
                this.leadDialog = false;
                this.lead = {};
            } catch (error) {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar lead' });
            } finally {
                this.saving.set(false);
            }
        }
    }

    getSeverity(status: string) {
        switch (status) {
            case 'Convertido':
                return 'success';
            case 'Novo':
                return 'info';
            case 'Perdido':
                return 'danger';
            case 'Em Negociação':
                return 'warn';
            default:
                return 'secondary';
        }
    }

    isPriority(lead: Lead): boolean {
        return !!lead.properties?.some(p => (p.area || 0) > 100);
    }

    addProperty() {
        if (!this.lead.properties) {
            this.lead.properties = [];
        }
        this.lead.properties.push({ leadId: this.lead.id, culture: 'Soja', area: 0, geometry: [] });
    }

    async saveProperty(prop: Property, index: number) {
        if (!prop.leadId) prop.leadId = this.lead.id;
        
        this.loadingProperties.set(true);
        try {
            const savedProp = await this.leadService.saveProperty(prop);
            if (this.lead.properties) {
                this.lead.properties[index] = savedProp;
            }
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Propriedade salva' });
        } catch (e) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar propriedade' });
        } finally {
            this.loadingProperties.set(false);
        }
    }

    async deleteProperty(prop: Property, index: number) {
        if (prop.id) {
            this.loadingProperties.set(true);
            try {
                await this.leadService.deleteProperty(prop.id);
                this.lead.properties?.splice(index, 1);
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Propriedade removida' });
            } catch (e) {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao remover propriedade' });
            } finally {
                this.loadingProperties.set(false);
            }
        } else {
            this.lead.properties?.splice(index, 1);
        }
    }

    openMap(property: Property, index: number) {
        this.activePropertyIndex = index;
        this.currentGeometry = property.geometry || [];
        this.mapVisible = true;
    }

    onMapSaved(geometry: { lat: number; lng: number }[]) {
        if (this.activePropertyIndex > -1 && this.lead.properties) {
            this.lead.properties[this.activePropertyIndex].geometry = geometry;
            
            // Calcular área automaticamente
            const hectares = this.calculateAreaInHectares(geometry);
            if (hectares > 0) {
                this.lead.properties[this.activePropertyIndex].area = parseFloat(hectares.toFixed(2));
            }
        }
        this.mapVisible = false;
        this.activePropertyIndex = -1;
    }

    // Algoritmo para calcular área de polígono esférico (aproximado)
    private calculateAreaInHectares(coords: { lat: number; lng: number }[]): number {
        if (!coords || coords.length < 3) return 0;

        const earthRadius = 6378137; // Raio da terra em metros
        let area = 0;

        const toRad = (deg: number) => (deg * Math.PI) / 180;

        for (let i = 0; i < coords.length; i++) {
            const j = (i + 1) % coords.length;
            const p1 = coords[i];
            const p2 = coords[j];

            area += (toRad(p2.lng) - toRad(p1.lng)) * (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
        }

        area = (area * earthRadius * earthRadius) / 2.0;
        const areaInSqMeters = Math.abs(area);
        
        return areaInSqMeters / 10000; // Converter m² para Hectares
    }

    onMapCancelled() {
        this.mapVisible = false;
        this.activePropertyIndex = -1;
    }

    isCpfValid(cpf: string | undefined): boolean {
        if (!cpf) return true; // Deixar passar se vazio (ou false se for obrigatório)
        const strCPF = cpf.replace(/[^\d]+/g, '');
        if (strCPF.length !== 11 || /^(\d)\1+$/.test(strCPF)) return false;

        let sum = 0, remainder;
        for (let i = 1; i <= 9; i++) sum += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(strCPF.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) sum += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        return remainder === parseInt(strCPF.substring(10, 11));
    }
}
