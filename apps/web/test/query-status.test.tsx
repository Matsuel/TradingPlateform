import { afterEach, expect, mock, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import en from "../messages/en.json"
import { ErrorState } from "../src/components/query-status"

afterEach(cleanup)

test("ErrorState affiche le message et relance au clic sur Retry", () => {
    const onRetry = mock(() => {})

    render(
        <NextIntlClientProvider locale="en" messages={en}>
            <ErrorState message="Backtest not found." onRetry={onRetry} />
        </NextIntlClientProvider>,
    )
    fireEvent.click(screen.getByRole("button", { name: en.common.retry }))

    expect(screen.getByText("Backtest not found.")).toBeTruthy()
    expect(onRetry).toHaveBeenCalledTimes(1)
})
