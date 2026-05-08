import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export const metadata = {
  title: "Pizza3.14 — API Docs",
  description: "Interactive REST API documentation for the Pizza3.14 system",
};

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            🍕 Pizza3.14 — API Documentation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Interactive OpenAPI 3.0 reference for all REST endpoints.
          </p>
        </div>
        <ReactSwagger spec={spec} />
      </div>
    </div>
  );
}
