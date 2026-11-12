import { afterEach, expect, mock, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { Dash, orDash } from "../src/components/dash"
import { EmptyCard } from "../src/components/empty-card"
import { FilterTabs } from "../src/components/filter-tabs"
import { StatCard } from "../src/components/stat-card"

afterEach(cleanup)

test("orDash formate une valeur présente et affiche le tiret pour une valeur absente", () => {
    expect(orDash(0.5, (v) => `${v * 100} %`)).toBe("50 %")
    // 0 est une valeur, pas une absence
    expect(orDash(0, (v) => `${v}`)).toBe("0")
    expect(orDash(null, String)).toEqual(<Dash />)
    expect(orDash(undefined, String)).toEqual(<Dash />)
})

test("StatCard affiche libellé, valeur, légende et variation", () => {
    render(<StatCard label="Rendement" value="12,5 %" caption="sur la période" delta="+2,1 %" trend="up" />)

    for (const text of ["Rendement", "12,5 %", "sur la période", "+2,1 %"]) expect(screen.getByText(text)).toBeTruthy()
})

test("StatCard sans variation n'affiche pas de badge", () => {
    render(<StatCard label="Frais" value="3 €" />)

    expect(screen.queryByText("+2,1 %")).toBeNull()
    expect(screen.getByText("3 €")).toBeTruthy()
})

test("FilterTabs marque l'option active et signale le choix d'une autre", () => {
    const onChange = mock<(value: string) => void>(() => {})
    render(
        <FilterTabs
            value="1m"
            onChange={onChange}
            options={[
                { value: "1d", label: "1 jour" },
                { value: "1m", label: "1 mois" },
            ]}
        />,
    )

    expect(screen.getByRole("tab", { name: "1 mois" }).getAttribute("aria-selected")).toBe("true")
    fireEvent.click(screen.getByRole("tab", { name: "1 jour" }))
    expect(onChange).toHaveBeenCalledWith("1d")
})

test("EmptyCard affiche son message", () => {
    render(<EmptyCard>Aucun backtest</EmptyCard>)

    expect(screen.getByText("Aucun backtest")).toBeTruthy()
})
