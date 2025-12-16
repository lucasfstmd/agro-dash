import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Lead, LeadService, Property } from '../service/lead.service';
import { MapDrawerComponent } from '../leads/components/map-drawer';

@Component({
    selector: 'app-properties',
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
        SelectModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        ConfirmDialogModule,
        MapDrawerComponent
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nova Propriedade" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="properties()"
            [rows]="10"
            [loading]="loading()"
            [paginator]="true"
            [globalFilterFields]="['municipality', 'culture', 'lead.name']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} propriedades"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Gerenciar Propriedades</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Pesquisar..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th pSortableColumn="lead.name" style="min-width:14rem">
                        Lead (Proprietário)
                        <p-sortIcon field="lead.name" />
                    </th>
                    <th pSortableColumn="municipality" style="min-width:14rem">
                        Município
                        <p-sortIcon field="municipality" />
                    </th>
                    <th pSortableColumn="culture" style="min-width:10rem">
                        Cultura
                        <p-sortIcon field="culture" />
                    </th>
                    <th pSortableColumn="area" style="min-width:10rem">
                        Área (ha)
                        <p-sortIcon field="area" />
                    </th>
                    <th style="min-width: 10rem">Ações</th>
                </tr>
            </ng-template>
            <ng-template #body let-prop>
                <tr>
                    <td>{{ prop.lead?.name || 'N/A' }}</td>
                    <td>{{ prop.municipality }}</td>
                    <td>
                        <p-tag [value]="prop.culture" [severity]="getSeverity(prop.culture)" />
                    </td>
                    <td>{{ prop.area }} ha</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editProperty(prop)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteProperty(prop)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="propertyDialog" [style]="{ width: '450px' }" header="Detalhes da Propriedade" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label for="lead" class="block font-bold mb-2">Lead (Proprietário)</label>
                        <p-select id="lead" [(ngModel)]="property.leadId" [options]="leads" optionLabel="name" optionValue="id" placeholder="Selecione um Lead" [filter]="true" appendTo="body" fluid [ngClass]="{'ng-invalid ng-dirty': submitted && !property.leadId}" />
                        <small class="text-red-500" *ngIf="submitted && !property.leadId">Lead é obrigatório.</small>
                    </div>

                    <div>
                        <label for="municipality" class="block font-bold mb-2">Município</label>
                        <p-select id="municipality" [(ngModel)]="property.municipality" [options]="municipalities" placeholder="Selecione" [filter]="true" appendTo="body" fluid [ngClass]="{'ng-invalid ng-dirty': submitted && !property.municipality}" />
                        <small class="text-red-500" *ngIf="submitted && !property.municipality">Município é obrigatório.</small>
                    </div>

                    <div>
                        <label for="culture" class="block font-bold mb-2">Cultura</label>
                        <p-select id="culture" [(ngModel)]="property.culture" [options]="cultures" placeholder="Selecione" appendTo="body" fluid />
                    </div>

                    <div>
                        <label for="area" class="block font-bold mb-2">Área (ha)</label>
                        <p-inputnumber id="area" [(ngModel)]="property.area" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="4" fluid />
                    </div>

                    <div class="flex justify-center pt-2">
                        <p-button label="Definir Geometria no Mapa" icon="pi pi-map" [outlined]="true" severity="help" (onClick)="openMap()" />
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancelar" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Salvar" icon="pi pi-check" (click)="saveProperty()" [loading]="saving()" />
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
export class Properties implements OnInit {
    propertyDialog: boolean = false;
    properties = signal<Property[]>([]);
    property!: Property;
    leads: Lead[] = [];
    
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    submitted: boolean = false;

    cultures: string[] = ['Soja', 'Milho', 'Algodão'];
    municipalities: string[] = []; // Populado no ngOnInit

    // Map State
    mapVisible: boolean = false;
    currentGeometry: { lat: number; lng: number }[] = [];

    constructor(
        private leadService: LeadService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadData();
        this.loadLeads();
        
        // Reutilizando a lista de municípios
        this.municipalities = [
            "Abadia dos Dourados", "Abaeté", "Abre Campo", "Acaiaca", "Açucena", "Água Boa", "Água Comprida", "Aguanil", "Águas Formosas", "Águas Vermelhas", "Aimorés", "Aiuruoca", "Alagoa", "Albertina", "Além Paraíba", "Alfenas", "Alfredo Vasconcelos", "Almenara", "Alpercata", "Alpinópolis", "Alterosa", "Alto Caparaó", "Alto Jequitibá", "Alto Rio Doce", "Alvarenga", "Alvinópolis", "Alvorada de Minas", "Amparo do Serra", "Andradas", "Andrelândia", "Angelândia", "Antônio Carlos", "Antônio Dias", "Antônio Prado de Minas", "Araçaí", "Aracitaba", "Araçuaí", "Araguari", "Arantina", "Araponga", "Araporã", "Arapuá", "Araújos", "Araxá", "Arceburgo", "Arcos", "Areado", "Argirita", "Aricanduva", "Arinos", "Astolfo Dutra", "Ataléia", "Augusto de Lima", "Baependi", "Baldim", "Bambuí", "Bandeira", "Bandeira do Sul", "Barão de Cocais", "Barão de Monte Alto", "Barbacena", "Barra Longa", "Barroso", "Bela Vista de Minas", "Belmiro Braga", "Belo Horizonte", "Belo Oriente", "Belo Vale", "Berilo", "Berizal", "Bertópolis", "Betim", "Bias Fortes", "Bicas", "Biquinhas", "Boa Esperança", "Bocaina de Minas", "Bocaiúva", "Bom Despacho", "Bom Jardim de Minas", "Bom Jesus da Penha", "Bom Jesus do Amparo", "Bom Jesus do Galho", "Bom Repouso", "Bom Sucesso", "Bonfim", "Bonfinópolis de Minas", "Bonito de Minas", "Borda da Mata", "Botelhos", "Botumirim", "Brás Pires", "Brasilândia de Minas", "Brasília de Minas", "Braúnas", "Brazópolis", "Brumadinho", "Bueno Brandão", "Buenópolis", "Bugre", "Buritis", "Buritizeiro", "Cabeceira Grande", "Cabo Verde", "Cachoeira da Prata", "Cachoeira de Minas", "Cachoeira de Pajeú", "Cachoeira Dourada", "Caetanópolis", "Caeté", "Caiana", "Cajuri", "Caldas", "Camacho", "Camanducaia", "Cambuí", "Cambuquira", "Campanário", "Campanha", "Campestre", "Campina Verde", "Campo Azul", "Campo Belo", "Campo do Meio", "Campo Florido", "Campos Altos", "Campos Gerais", "Cana Verde", "Canaã", "Canápolis", "Candeias", "Cantagalo", "Caparaó", "Capela Nova", "Capelinha", "Capetinga", "Capim Branco", "Capinópolis", "Capitão Andrade", "Capitão Enéas", "Capitólio", "Caputira", "Caraí", "Caranaíba", "Carandaí", "Carangola", "Caratinga", "Carbonita", "Careaçu", "Carlos Chagas", "Carmésia", "Carmo da Cachoeira", "Carmo da Mata", "Carmo de Minas", "Carmo do Cajuru", "Carmo do Paranaíba", "Carmo do Rio Claro", "Carmópolis de Minas", "Carneirinho", "Carrancas", "Carvalhópolis", "Carvalhos", "Casa Grande", "Cascalho Rico", "Cássia", "Cataguases", "Catas Altas", "Catas Altas da Noruega", "Catuji", "Catuti", "Caxambu", "Cedro do Abaeté", "Central de Minas", "Centralina", "Chácara", "Chalé", "Chapada do Norte", "Chapada Gaúcha", "Chiador", "Cipotânea", "Claraval", "Claro dos Poções", "Cláudio", "Coimbra", "Coluna", "Comendador Gomes", "Comercinho", "Conceição da Aparecida", "Conceição da Barra de Minas", "Conceição das Alagoas", "Conceição das Pedras", "Conceição de Ipanema", "Conceição do Mato Dentro", "Conceição do Pará", "Conceição do Rio Verde", "Conceição dos Ouros", "Cônego Marinho", "Confins", "Congonhal", "Congonhas", "Congonhas do Norte", "Conquista", "Conselheiro Lafaiete", "Conselheiro Pena", "Consolação", "Contagem", "Coqueiral", "Coração de Jesus", "Cordisburgo", "Cordislândia", "Corinto", "Coroaci", "Coromandel", "Coronel Fabriciano", "Coronel Murta", "Coronel Pacheco", "Coronel Xavier Chaves", "Córrego Danta", "Córrego do Bom Jesus", "Córrego Fundo", "Córrego Novo", "Couto de Magalhães de Minas", "Crisólita", "Cristais", "Cristália", "Cristiano Otoni", "Cristina", "Crucilândia", "Cruzeiro da Fortaleza", "Cruzília", "Cuparaque", "Curral de Dentro", "Curvelo", "Datas", "Delfim Moreira", "Delfinópolis", "Delta", "Descoberto", "Desterro de Entre Rios", "Desterro do Melo", "Diamantina", "Diogo de Vasconcelos", "Dionísio", "Divinésia", "Divino", "Divino das Laranjeiras", "Divinolândia de Minas", "Divinópolis", "Divisa Alegre", "Divisa Nova", "Divisópolis", "Dom Bosco", "Dom Cavati", "Dom Joaquim", "Dom Silvério", "Dom Viçoso", "Dona Euzébia", "Dores de Campos", "Dores de Guanhães", "Dores do Indaiá", "Dores do Turvo", "Doresópolis", "Douradoquara", "Durandé", "Elói Mendes", "Engenheiro Caldas", "Engenheiro Navarro", "Entre Folhas", "Entre Rios de Minas", "Ervália", "Esmeraldas", "Espera Feliz", "Espinosa", "Espírito Santo do Dourado", "Estiva", "Estrela Dalva", "Estrela do Indaiá", "Estrela do Sul", "Eugenópolis", "Ewbank da Câmara", "Extrema", "Fama", "Faria Lemos", "Felício dos Santos", "Felisburgo", "Felixlândia", "Fernandes Tourinho", "Ferros", "Fervedouro", "Florestal", "Formiga", "Formoso", "Fortaleza de Minas", "Fortuna de Minas", "Francisco Badaró", "Francisco Dumont", "Francisco Sá", "Franciscópolis", "Frei Gaspar", "Frei Inocêncio", "Frei Lagonegro", "Fronteira", "Fronteira dos Vales", "Fruta de Leite", "Frutal", "Funilândia", "Galiléia", "Gameleiras", "Glaucilândia", "Goiabeira", "Goianá", "Gonçalves", "Gonzaga", "Gouveia", "Governador Valadares", "Grão Mogol", "Grupiara", "Guanhães", "Guapé", "Guaraciaba", "Guaraciama", "Guaranésia", "Guarani", "Guarará", "Guarda-Mor", "Guaxupé", "Guidoval", "Guimarânia", "Guiricema", "Gurinhatã", "Heliodora", "Iapu", "Ibertioga", "Ibiá", "Ibiaí", "Ibiracatu", "Ibiraci", "Ibirité", "Ibitiúra de Minas", "Ibituruna", "Icaraí de Minas", "Igarapé", "Igaratinga", "Iguatama", "Ijaci", "Ilicínea", "Imbé de Minas", "Inconfidentes", "Indaiabira", "Indianópolis", "Ingaí", "Inhapim", "Inhaúma", "Inimutaba", "Ipaba", "Ipanema", "Ipatinga", "Ipiaçu", "Ipuiúna", "Iraí de Minas", "Itabira", "Itabirinha", "Itabirito", "Itacambira", "Itacarambi", "Itaguara", "Itaipé", "Itajubá", "Itamarandiba", "Itamarati de Minas", "Itambacuri", "Itambé do Mato Dentro", "Itamogi", "Itamonte", "Itanhandu", "Itanhomi", "Itaobim", "Itapagipe", "Itapecerica", "Itapeva", "Itatiaiuçu", "Itaú de Minas", "Itaúna", "Itaverava", "Itinga", "Itueta", "Ituiutaba", "Itumirim", "Iturama", "Itutinga", "Jaboticatubas", "Jacinto", "Jacuí", "Jacutinga", "Jaguaraçu", "Jaíba", "Jampruca", "Janaúba", "Januária", "Japaraíba", "Japonvar", "Jeceaba", "Jenipapo de Minas", "Jequeri", "Jequitaí", "Jequitibá", "Jequitinhonha", "Jesuânia", "Joaíma", "Joanésia", "João Monlevade", "João Pinheiro", "Joaquim Felício", "Jordânia", "José Gonçalves de Minas", "José Raydan", "Josenópolis", "Juatuba", "Juiz de Fora", "Juramento", "Juruaia", "Juvenília", "Ladainha", "Lagamar", "Lagoa da Prata", "Lagoa dos Patos", "Lagoa Dourada", "Lagoa Formosa", "Lagoa Grande", "Lagoa Santa", "Lajinha", "Lambari", "Lamim", "Laranjal", "Lassance", "Lavras", "Leandro Ferreira", "Leme do Prado", "Leopoldina", "Liberdade", "Lima Duarte", "Limeira do Oeste", "Lontra", "Luisburgo", "Luislândia", "Luminárias", "Luz", "Machacalis", "Machado", "Madre de Deus de Minas", "Malacacheta", "Mamonas", "Manga", "Manhuaçu", "Manhumirim", "Mantena", "Mar de Espanha", "Maravilhas", "Maria da Fé", "Mariana", "Marilac", "Mário Campos", "Maripá de Minas", "Marliéria", "Marmelópolis", "Martinho Campos", "Martins Soares", "Mata Verde", "Materlândia", "Mateus Leme", "Mathias Lobato", "Matias Barbosa", "Matias Cardoso", "Matipó", "Mato Verde", "Matozinhos", "Matutina", "Medeiros", "Medina", "Mendes Pimentel", "Mercês", "Mesquita", "Minas Novas", "Minduri", "Mirabela", "Miradouro", "Miraí", "Miravânia", "Moeda", "Moema", "Monjolos", "Monsenhor Paulo", "Montalvânia", "Monte Alegre de Minas", "Monte Azul", "Monte Belo", "Monte Carmelo", "Monte Formoso", "Monte Santo de Minas", "Monte Sião", "Montes Claros", "Montezuma", "Morada Nova de Minas", "Morro da Garça", "Morro do Pilar", "Munhoz", "Muriaé", "Mutum", "Muzambinho", "Nacip Raydan", "Nanuque", "Naque", "Natalândia", "Natércia", "Nazareno", "Nepomuceno", "Ninheira", "Nova Belém", "Nova Era", "Nova Lima", "Nova Módica", "Nova Ponte", "Nova Porteirinha", "Nova Resende", "Nova Serrana", "Nova União", "Novo Cruzeiro", "Novo Oriente de Minas", "Novorizonte", "Olaria", "Olhos-d'Água", "Olímpio Noronha", "Oliveira", "Oliveira Fortes", "Onça de Pitangui", "Oratórios", "Orizânia", "Ouro Branco", "Ouro Fino", "Ouro Preto", "Ouro Verde de Minas", "Padre Carvalho", "Padre Paraíso", "Pai Pedro", "Paineiras", "Pains", "Paiva", "Palma", "Palmópolis", "Papagaios", "Pará de Minas", "Paracatu", "Paraguaçu", "Paraisópolis", "Paraopeba", "Passa Quatro", "Passa Tempo", "Passa Vinte", "Passabém", "Passos", "Patis", "Patos de Minas", "Patrocínio", "Patrocínio do Muriaé", "Paula Cândido", "Paulistas", "Pavão", "Peçanha", "Pedra Azul", "Pedra Bonita", "Pedra do Anta", "Pedra do Indaiá", "Pedra Dourada", "Pedralva", "Pedras de Maria da Cruz", "Pedrinópolis", "Pedro Leopoldo", "Pedro Teixeira", "Pequeri", "Pequi", "Perdigão", "Perdizes", "Perdões", "Periquito", "Pescador", "Piau", "Piedade de Caratinga", "Piedade de Ponte Nova", "Piedade do Rio Grande", "Piedade dos Gerais", "Pimenta", "Pingo-d'Água", "Pintópolis", "Piracema", "Pirajuba", "Piranga", "Piranguçu", "Piranguinho", "Pirapetinga", "Pirapora", "Piraúba", "Pitangui", "Piumhi", "Planura", "Poço Fundo", "Poços de Caldas", "Pocrane", "Pompéu", "Ponte Nova", "Ponto Chique", "Ponto dos Volantes", "Porteirinha", "Porto Firme", "Poté", "Pouso Alegre", "Pouso Alto", "Prados", "Prata", "Pratápolis", "Pratinha", "Presidente Bernardes", "Presidente Juscelino", "Presidente Kubitschek", "Presidente Olegário", "Prudente de Morais", "Quartel Geral", "Queluzito", "Raposos", "Raul Soares", "Recreio", "Reduto", "Resende Costa", "Resplendor", "Ressaquinha", "Riachinho", "Riacho dos Machados", "Ribeirão das Neves", "Ribeirão Vermelho", "Rio Acima", "Rio Casca", "Rio do Prado", "Rio Doce", "Rio Espera", "Rio Manso", "Rio Novo", "Rio Paranaíba", "Rio Pardo de Minas", "Rio Piracicaba", "Rio Pomba", "Rio Preto", "Rio Vermelho", "Ritápolis", "Rochedo de Minas", "Rodeiro", "Romaria", "Rosário da Limeira", "Rubelita", "Rubim", "Sabará", "Sabinópolis", "Sacramento", "Salinas", "Salto da Divisa", "Santa Bárbara", "Santa Bárbara do Leste", "Santa Bárbara do Monte Verde", "Santa Bárbara do Tugúrio", "Santa Cruz de Minas", "Santa Cruz de Salinas", "Santa Cruz do Escalvado", "Santa Efigênia de Minas", "Santa Fé de Minas", "Santa Helena de Minas", "Santa Juliana", "Santa Luzia", "Santa Margarida", "Santa Maria de Itabira", "Santa Maria do Salto", "Santa Maria do Suaçuí", "Santa Rita de Caldas", "Santa Rita de Ibitipoca", "Santa Rita de Jacutinga", "Santa Rita de Minas", "Santa Rita do Itueto", "Santa Rita do Sapucaí", "Santa Rosa da Serra", "Santa Vitória", "Santana da Vargem", "Santana de Cataguases", "Santana de Pirapama", "Santana do Deserto", "Santana do Garambéu", "Santana do Jacaré", "Santana do Manhuaçu", "Santana do Paraíso", "Santana do Riacho", "Santana dos Montes", "Santo Antônio do Amparo", "Santo Antônio do Aventureiro", "Santo Antônio do Grama", "Santo Antônio do Itambé", "Santo Antônio do Jacinto", "Santo Antônio do Monte", "Santo Antônio do Retiro", "Santo Antônio do Rio Abaixo", "Santo Hipólito", "Santos Dumont", "São Bento Abade", "São Brás do Suaçuí", "São Domingos das Dores", "São Domingos do Prata", "São Félix de Minas", "São Francisco", "São Francisco de Paula", "São Francisco de Sales", "São Francisco do Glória", "São Geraldo", "São Geraldo da Piedade", "São Geraldo do Baixio", "São Gonçalo do Abaeté", "São Gonçalo do Pará", "São Gonçalo do Rio Abaixo", "São Gonçalo do Rio Preto", "São Gonçalo do Sapucaí", "São Gotardo", "São João Batista do Glória", "São João da Lagoa", "São João da Mata", "São João da Ponte", "São João das Missões", "São João del Rei", "São João do Manhuaçu", "São João do Manteninha", "São João do Oriente", "São João do Pacuí", "São João do Paraíso", "São João Evangelista", "São João Nepomuceno", "São Joaquim de Bicas", "São José da Barra", "São José da Lapa", "São José da Safira", "São José da Varginha", "São José do Alegre", "São José do Divino", "São José do Goiabal", "São José do Jacuri", "São José do Mantimento", "São Lourenço", "São Miguel do Anta", "São Pedro da União", "São Pedro do Suaçuí", "São Pedro dos Ferros", "São Romão", "São Roque de Minas", "São Sebastião da Bela Vista", "São Sebastião da Vargem Alegre", "São Sebastião do Anta", "São Sebastião do Maranhão", "São Sebastião do Oeste", "São Sebastião do Paraíso", "São Sebastião do Rio Preto", "São Sebastião do Rio Verde", "São Tiago", "São Tomás de Aquino", "São Tomé das Letras", "São Vicente de Minas", "Sapucaí-Mirim", "Sardoá", "Sarzedo", "Sem-Peixe", "Senador Amaral", "Senador Cortes", "Senador Firmino", "Senador José Bento", "Senador Modestino Gonçalves", "Senhora de Oliveira", "Senhora do Porto", "Senhora dos Remédios", "Sericita", "Seritinga", "Serra Azul de Minas", "Serra da Saudade", "Serra do Salitre", "Serra dos Aimorés", "Serrania", "Serranópolis de Minas", "Serranos", "Serro", "Sete Lagoas", "Setubinha", "Silveirânia", "Silvianópolis", "Simão Pereira", "Simonésia", "Sobrália", "Soledade de Minas", "Tabuleiro", "Taiobeiras", "Taparuba", "Tapira", "Tapiraí", "Taquaraçu de Minas", "Tarumirim", "Teixeiras", "Teófilo Otoni", "Timóteo", "Tiradentes", "Tiros", "Tocantins", "Tocos do Moji", "Toledo", "Tombos", "Três Corações", "Três Marias", "Três Pontas", "Tumiritinga", "Tupaciguara", "Turmalina", "Turvolândia", "Ubá", "Ubaí", "Ubaporanga", "Uberaba", "Uberlândia", "Umburatiba", "Unaí", "União de Minas", "Uruana de Minas", "Urucânia", "Urucuia", "Vargem Alegre", "Vargem Bonita", "Vargem Grande do Rio Pardo", "Varginha", "Varjão de Minas", "Várzea da Palma", "Varzelândia", "Vazante", "Verdelândia", "Veredinha", "Veríssimo", "Vermelho Novo", "Vespasiano", "Viçosa", "Vieiras", "Virgem da Lapa", "Virgínia", "Virginópolis", "Virgolândia", "Visconde do Rio Branco", "Volta Grande", "Wenceslau Braz"
        ];
    }

    async loadData() {
        this.loading.set(true);
        try {
            const data = await this.leadService.getAllProperties();
            this.properties.set(data);
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar propriedades' });
        } finally {
            this.loading.set(false);
        }
    }

    async loadLeads() {
        try {
            this.leads = await this.leadService.getLeads();
        } catch (e) {
            console.error('Erro ao carregar leads', e);
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.property = { geometry: [] };
        this.submitted = false;
        this.propertyDialog = true;
    }

    editProperty(prop: Property) {
        this.property = { ...prop };
        this.propertyDialog = true;
    }

    deleteProperty(prop: Property) {
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja excluir esta propriedade?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loading.set(true);
                this.leadService.deleteProperty(prop.id!).then(async () => {
                    await this.loadData();
                    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Propriedade excluída' });
                }).catch(() => {
                    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir propriedade' });
                    this.loading.set(false);
                });
            }
        });
    }

    hideDialog() {
        this.propertyDialog = false;
        this.submitted = false;
    }

    async saveProperty() {
        this.submitted = true;

        if (this.property.leadId && this.property.municipality) {
            this.saving.set(true);
            try {
                await this.leadService.saveProperty(this.property);
                await this.loadData();
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Propriedade salva' });
                this.propertyDialog = false;
                this.property = {};
            } catch (error) {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar propriedade' });
            } finally {
                this.saving.set(false);
            }
        }
    }

    getSeverity(culture: string | undefined) {
        switch (culture) {
            case 'Soja': return 'success';
            case 'Milho': return 'warn';
            case 'Algodão': return 'info';
            default: return 'secondary';
        }
    }

    openMap() {
        this.currentGeometry = this.property.geometry || [];
        this.mapVisible = true;
    }

    onMapSaved(geometry: { lat: number; lng: number }[]) {
        this.property.geometry = geometry;
        
        // Calcular área automaticamente
        const hectares = this.calculateAreaInHectares(geometry);
        if (hectares > 0) {
            this.property.area = parseFloat(hectares.toFixed(2));
        }
        
        this.mapVisible = false;
    }

    onMapCancelled() {
        this.mapVisible = false;
    }

    private calculateAreaInHectares(coords: { lat: number; lng: number }[]): number {
        if (!coords || coords.length < 3) return 0;

        const earthRadius = 6378137;
        let area = 0;
        const toRad = (deg: number) => (deg * Math.PI) / 180;

        for (let i = 0; i < coords.length; i++) {
            const j = (i + 1) % coords.length;
            const p1 = coords[i];
            const p2 = coords[j];
            area += (toRad(p2.lng) - toRad(p1.lng)) * (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
        }

        area = (area * earthRadius * earthRadius) / 2.0;
        return Math.abs(area) / 10000;
    }
}