/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseManager {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    // 🔹 Fetch all records
    async getAll() {
        const { data, error } = await supabase.from(this.tableName).select("*");
        if (error) {
            console.error("Error fetching data:", error);
            return null;
        }
        return data;
    }

    // 🔹 Fetch a single record by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching user:", error);
        }
        return data;
    }

    // 🔹 Insert a new record and return inserted data
    async insert(data: any) {
        const { data: insertedData, error } = await supabase
            .from(this.tableName)
            .insert([data])
            .select();

        if (error) {
            console.error("Error inserting data:", error);
            return null;
        }
        return insertedData;
    }

    // 🔹 Update a record and return updated data
    async update(id: string, updatedData: any) {
        const { data, error } = await supabase
            .from(this.tableName)
            .update(updatedData)
            .eq("id", id)
            .select();

        if (error) {
            console.error("Error updating data:", error);
            return null;
        }
        return data;
    }

    // 🔹 Delete a record and confirm success
    async delete(id: string) {
        const { error, count } = await supabase
            .from(this.tableName)
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting data:", error);
            return false;
        }
        return count !== 0;
    }
}
