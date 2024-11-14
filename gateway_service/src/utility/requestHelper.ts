import { Request, Response } from "express";
const axios = require("axios");

export function sendPutRequest(path: string, service: string, id: string) {
  return async (req: Request, res: Response) => {
    try {
      let resp = await axios.put(`${service}/${path}/${id}`, req.body);
      res.json(resp.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response?.data?.error);
      } else {
        res.status(400).send(error.message);
      }
    }
  };
}

export function sendGetRequest(path: string, service: string) {
  return async (req: Request, res: Response) => {
    try {
      // Construct the full URL
      let url = `${service}/${path}`;

      // Replace path parameters
      Object.keys(req.params).forEach((param) => {
        url = url.replace(`:${param}`, req.params[param]);
      });

      // Append query string if it exists
      if (Object.keys(req.query).length > 0) {
        url += `?${new URLSearchParams(req.query as Record<string, string>).toString()}`;
      }

      console.log(`Forwarding request to: ${url}`);

      // Send the request
      let resp = await axios.get(url, {
        headers: {
          ...req.headers,
          host: new URL(service).host, // Update the host header
        },
      });

      res.status(200).json(resp.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response?.data?.error);
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };
}

export function sendPostRequest(path: string, service: string) {
  return async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      console.log("body");
      let resp = await axios.post(`${service}/${path}`, req.body);
      console.log(resp.data);
      res.status(200).json(resp.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response?.data?.error);
      } else {
        res.status(400).send(error.message);
      }
    }
  };
}

export function sendDeleteRequest(path: string, service: string, id: string) {
  return async (req: Request, res: Response) => {
    try {
      let resp = await axios.delete(`${service}/${path}/${id}`);
      res.status(200).json(resp.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response?.data?.error);
      } else {
        res.status(400).send(error.message);
      }
    }
  };
}
