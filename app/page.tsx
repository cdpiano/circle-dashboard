import Header from '@/components/layout/Header';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import GridCard from '@/components/dashboard/GridCard';
import StockPrice from '@/components/dashboard/StockPrice';
import UsdcCirculation from '@/components/dashboard/UsdcCirculation';
import MintBurn from '@/components/dashboard/MintBurn';
import UsdcPeg from '@/components/dashboard/UsdcPeg';
import CpnVolume from '@/components/dashboard/CpnVolume';
import OnchainVolume from '@/components/dashboard/OnchainVolume';
import DefiDistribution from '@/components/dashboard/DefiDistribution';
import FinancialMetrics from '@/components/dashboard/FinancialMetrics';
import StablecoinCompetition from '@/components/dashboard/StablecoinCompetition';
import Legislation from '@/components/dashboard/Legislation';
import ReserveVsRate from '@/components/dashboard/ReserveVsRate';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="py-2">
        <DashboardGrid>
          {/* Row 1-2: Stock (3x2) + USDC Supply (2x1) + Legislation (1x2) */}
          <GridCard colSpan={3} rowSpan={2}>
            <StockPrice />
          </GridCard>
          <GridCard colSpan={2} rowSpan={1}>
            <UsdcCirculation />
          </GridCard>
          <GridCard colSpan={1} rowSpan={2}>
            <Legislation />
          </GridCard>

          {/* Row 2: MintBurn + Peg under USDC Supply */}
          <GridCard colSpan={1} rowSpan={1}>
            <MintBurn />
          </GridCard>
          <GridCard colSpan={1} rowSpan={1}>
            <UsdcPeg />
          </GridCard>

          {/* Row 3: Financials (3x1) + Competition (3x1) */}
          <GridCard colSpan={3} rowSpan={1}>
            <FinancialMetrics />
          </GridCard>
          <GridCard colSpan={3} rowSpan={1}>
            <StablecoinCompetition />
          </GridCard>

          {/* Row 4: DeFi TVL (3x1) + Reserve vs Rate (3x1) */}
          <GridCard colSpan={3} rowSpan={1}>
            <DefiDistribution />
          </GridCard>
          <GridCard colSpan={3} rowSpan={1}>
            <ReserveVsRate />
          </GridCard>

          {/* Row 5: CPN (1x1) + OnChain (1x1) */}
          <GridCard colSpan={1} rowSpan={1}>
            <CpnVolume />
          </GridCard>
          <GridCard colSpan={1} rowSpan={1}>
            <OnchainVolume />
          </GridCard>
        </DashboardGrid>
      </main>
    </div>
  );
}
