// services/businessService.ts
import axios from "axios";
import type { Business } from "../types/business";

const API_URL = import.meta.env.VITE_API_URL;

export const businessService = {
  getBusiness,
  getAllBusinesses,
  updateBusiness,
  createBusiness,
  deleteBusiness,
};

async function getBusiness(accessToken: string, businessId: string): Promise<Business> {
  const { data } = await axios.get<{ business: Business }>(
    `${API_URL}/businesses/${businessId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return data.business;
}

async function getAllBusinesses(accessToken: string): Promise<Business[]> {
  const { data } = await axios.get<{ businesses: Business[] }>(
    `${API_URL}/businesses`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return data.businesses;
}

async function updateBusiness(accessToken: string, businessId: string, payload: Partial<Business>): Promise<Business> {
  const { data } = await axios.patch<{ business: Business }>(
    `${API_URL}/businesses/${businessId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return data.business;
}

async function createBusiness(accessToken: string, payload: Partial<Business>): Promise<Business> {
  const { data } = await axios.post<{ business: Business }>(
    `${API_URL}/businesses`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return data.business;
}


async function deleteBusiness(accessToken: string, businessId: string): Promise<void> {
  await axios.delete(`${API_URL}/businesses/${businessId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}