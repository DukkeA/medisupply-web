import React, { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/utils/classNames'

// Import JSON data directly
import countries from '@/data/countries.json'
import states from '@/data/states.json'

interface Timezone {
  zoneName: string
  gmtOffset: number
  gmtOffsetName: string
  abbreviation: string
  tzName: string
}

interface CountryProps {
  id: number
  name: string
  iso3: string
  iso2: string
  numeric_code: string
  phone_code: string
  capital: string
  currency: string
  currency_name: string
  currency_symbol: string
  tld: string
  native: string
  region: string
  region_id: string
  subregion: string
  subregion_id: string
  nationality: string
  timezones: Timezone[]
  translations: Record<string, string>
  latitude: string
  longitude: string
  emoji: string
  emojiU: string
}

interface StateProps {
  id: number
  name: string
  country_id: number
  country_code: string
  country_name: string
  state_code: string
  type: string | null
  latitude: string
  longitude: string
}

interface LocationSelectorProps {
  disabled?: boolean
  onCountryChange?: (country: CountryProps | null) => void
  onStateChange?: (state: StateProps | null) => void
  showStates?: boolean
  countryLabel?: string
  stateLabel?: string
}

const LocationSelector = ({
  disabled,
  onCountryChange,
  onStateChange,
  showStates = false,
  countryLabel,
  stateLabel
}: LocationSelectorProps) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryProps | null>(
    null
  )
  const [selectedState, setSelectedState] = useState<StateProps | null>(null)
  const [openCountryDropdown, setOpenCountryDropdown] = useState(false)
  const [openStateDropdown, setOpenStateDropdown] = useState(false)

  // Cast imported JSON data to their respective types
  const countriesData = countries as CountryProps[]
  const statesData = states as StateProps[]

  // Filter states for selected country
  const availableStates = statesData.filter(
    (state) => state.country_id === selectedCountry?.id
  )

  const handleCountrySelect = (country: CountryProps | null) => {
    setSelectedCountry(country)
    setSelectedState(null) // Reset state when country changes
    onCountryChange?.(country)
    onStateChange?.(null)
  }

  const handleStateSelect = (state: StateProps | null) => {
    setSelectedState(state)
    onStateChange?.(state)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Country Selector */}
      <div className="grid gap-2">
        {countryLabel && <Label>{countryLabel}</Label>}
        <Popover
          open={openCountryDropdown}
          onOpenChange={setOpenCountryDropdown}
          modal
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCountryDropdown}
              disabled={disabled}
              className="w-full justify-between"
            >
              {selectedCountry ? (
                <div className="flex items-center gap-2">
                  <span>{selectedCountry.emoji}</span>
                  <span>{selectedCountry.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select Country...</span>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[300px]">
                    {countriesData.map((country) => (
                      <CommandItem
                        key={country.id}
                        value={country.name}
                        onSelect={() => {
                          handleCountrySelect(country)
                          setOpenCountryDropdown(false)
                        }}
                        className="flex cursor-pointer items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span>{country.emoji}</span>
                          <span>{country.name}</span>
                        </div>
                        <Check
                          className={cn(
                            'h-4 w-4',
                            selectedCountry?.id === country.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* State Selector - Only shown if showStates is true and selected country has states */}
      {showStates && availableStates.length > 0 && (
        <div className="grid gap-2">
          {stateLabel && <Label>{stateLabel}</Label>}
          <Popover open={openStateDropdown} onOpenChange={setOpenStateDropdown}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStateDropdown}
                disabled={!selectedCountry}
                className="w-full justify-between"
              >
                {selectedState ? (
                  <span>{selectedState.name}</span>
                ) : (
                  <span className="text-muted-foreground">Select State...</span>
                )}
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search state..." />
                <CommandList>
                  <CommandEmpty>No state found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-[300px]">
                      {availableStates.map((state) => (
                        <CommandItem
                          key={state.id}
                          value={state.name}
                          onSelect={() => {
                            handleStateSelect(state)
                            setOpenStateDropdown(false)
                          }}
                          className="flex cursor-pointer items-center justify-between text-sm"
                        >
                          <span>{state.name}</span>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              selectedState?.id === state.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}

export default LocationSelector
