import { Request, Response } from "express";
const axios = require("axios");

export function sendPutRequest(path: string, service: string, id: string) {
  return async (req: Request, res: Response) => {
    try {
      let resp = await axios.put(`${service}/${path}/${id}`);
      res.json(resp.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response.body);
      } else {
        res.status(400).send(error.message);
      }
    }
  };
}

export function sendGetRequest(path: string, service: string, id: string = "") {
  console.log(service);
  return async (req: Request, res: Response) => {
    try {
      let resp = await axios.get(`${service}/${path}/${id}`);
      res.status(200).json(resp.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response.body);
      } else {
        res.status(400).send(error.message);
      }
    }
  };
}

export function sendPostRequest(path: string, service: string) {
  return async (req: Request, res: Response) => {
    try {
      let resp = await axios.post(`${service}/${path}`);
      res.status(200).json(resp.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response.body);
      } else {
        res.status(400).send(error.message);
      }
    }
  };
}

export function sendDeleteRequest(path: string, service: string, id: string) {
  return async (req: Request, res: Response) => {
    try {
      let resp = await axios.delete(`${service}/${path}`);
      res.status(200).json(resp.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response.body);
      } else {
        res.status(400).send(error.message);
      }
    }
  };
}
