"use client"

import { useEffect, useState } from "react"
import { fetchAqiData } from "@/lib/api"
import { dummyAqiData } from "@/lib/dummy-data"
import AqiCard from "./aqi-card"
import type { AqiData } from "@/lib/types"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AqiDashboard() {
  const [aqiData, setAqiData] = useState<AqiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setUsingFallback(false)

    try {
      const data = await fetchAqiData()
      setAqiData(data)
    } catch (err) {
      console.error("Failed to fetch AQI data, using fallback data", err)
      setAqiData(dummyAqiData)
      setUsingFallback(true)
      setError("Could not connect to AQI API. Using fallback data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Current Air Quality</h2>
          <p className="text-gray-600">{usingFallback ? "Using fallback data" : "Live data from API"}</p>
        </div>
        <Button onClick={loadData} variant="outline" className="bg-white hover:bg-gray-50" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-center items-center gap-6 w-full">
        {loading ? (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 h-64 animate-pulse max-w-md w-full">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-24 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 h-64 animate-pulse max-w-md w-full hidden md:block">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-24 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </>
        ) : aqiData ? (
          <>
            <AqiCard
              title="Current AQI"
              value={aqiData.current.value}
              location={aqiData.location}
              timestamp={aqiData.current.timestamp}
            />
            <AqiCard
              title="Predicted AQI (next hour)"
              value={aqiData.pm10.value}
              location={aqiData.location}
              timestamp={aqiData.current.timestamp}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
