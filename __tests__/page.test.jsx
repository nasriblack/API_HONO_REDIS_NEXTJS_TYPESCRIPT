import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import Home from '../src/app/page'
import { countryName } from '@/lib/mockFetch';



window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(countryName),
  })
);

beforeEach(() => {
  fetch.mockClear();
});

const value = 'tu'


const renderApp = () => {
  render(<Home />)
  return {
    selectInput: screen.getByRole('combobox'),
    paragrapheTag: screen.getByRole('paragraph'),
    heading: screen.getByRole('heading', { level: 1 }),
  }
}

describe('Rendering Basics', () => {
  test('rendering element', () => {
    const { selectInput, heading, paragrapheTag } = renderApp()
    expect(selectInput).toBeInTheDocument()
    expect(paragrapheTag).toBeInTheDocument()
    expect(heading).toBeInTheDocument()
  })
  test('Checking the content Value of Tags', () => {
    const { heading, paragrapheTag, selectInput } = renderApp()
    expect(heading).toHaveTextContent('SpeedSearch ⚡')
    expect(paragrapheTag).toHaveTextContent('A high-performance API built with Hono, Next.js and Cloudflare.')
    expect(selectInput).toHaveValue('')
  })
})

describe('Search Interaction', () => {
  test('Checking the content Value input', async () => {
    const { selectInput } = renderApp()
    fireEvent.change(selectInput, { target: { value } })
    expect(selectInput).toHaveValue(value)
    expect(fetch).toHaveBeenCalledWith(
      `/api/search?q=${value}`
    )
    expect(await screen.findByRole('paragraph', { value: `Found ${countryName.results.length} result in ${countryName.duration}ms` }))
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(await screen.findByRole("group")).toBeInTheDocument();
    const tunisiaOption = await screen.findByRole('option', { name: 'TUNISIA' })
    expect(tunisiaOption).toBeInTheDocument()
    expect(tunisiaOption).toHaveAttribute('data-value', 'TUNISIA')
    fireEvent.click(tunisiaOption);
    expect(selectInput).toHaveValue('TUNISIA')
  })
})

