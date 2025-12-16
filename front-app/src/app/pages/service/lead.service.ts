import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

export interface Property {
    id?: string;
    lead?: Lead;
    leadId?: string;
    culture?: 'Soja' | 'Milho' | 'Algodão';
    area?: number; // In Hectares
    geometry?: { lat: number; lng: number }[];
    municipality?: string;
}

export interface LeadFilter {
    name?: string;
    cpf?: string;
    status?: string;
    municipality?: string;
}

export interface Lead {
    id?: string;
    name?: string;
    cpf?: string;
    status?: 'Novo' | 'Contato Inicial' | 'Em Negociação' | 'Convertido' | 'Perdido';
    comments?: string;
    municipality?: string;
    properties?: Property[];
}

@Injectable({
    providedIn: 'root'
})
export class LeadService {
    private apiUrl = `${environment.apiUrl}/v1/leads`;
    private propertyUrl = `${environment.apiUrl}/v1/properties`;

    async getLeads(filter?: LeadFilter): Promise<Lead[]> {
        const params: any = {};
        if (filter) {
            if (filter.name) params.name = filter.name;
            if (filter.cpf) params.cpf = filter.cpf;
            if (filter.status) params.status = filter.status;
            if (filter.municipality) params.municipality = filter.municipality;
        }
        const response = await axios.get<Lead[]>(this.apiUrl, { params });
        return response.data;
    }

    async getLead(id: string): Promise<Lead> {
        const response = await axios.get<Lead>(`${this.apiUrl}/${id}`);
        return response.data;
    }

    async saveLead(lead: Lead): Promise<Lead> {
        // Remove properties from lead object to avoid sending them to the lead endpoint
        const { properties, ...leadData } = lead;

        if (leadData.id) {
            // Update
            const response = await axios.patch<Lead>(`${this.apiUrl}/${leadData.id}`, leadData);
            return response.data;
        } else {
            // Create
            const response = await axios.post<Lead>(this.apiUrl, leadData);
            return response.data;
        }
    }

    async deleteLead(id: string): Promise<void> {
        await axios.delete(`${this.apiUrl}/${id}`);
    }

    async getProperties(leadId: string): Promise<Property[]> {
        const response = await axios.get<Property[]>(`${this.propertyUrl}/lead/${leadId}`);
        return response.data;
    }

    async getAllProperties(): Promise<Property[]> {
        const response = await axios.get<Property[]>(this.propertyUrl);
        return response.data;
    }

    async saveProperty(property: Property): Promise<Property> {
        if (property.id) {
            const response = await axios.patch<Property>(`${this.propertyUrl}/${property.id}`, property);
            return response.data;
        }
        return (await axios.post<Property>(this.propertyUrl, property)).data;
    }

    async deleteProperty(id: string): Promise<void> {
        await axios.delete(`${this.propertyUrl}/${id}`);
    }
}
