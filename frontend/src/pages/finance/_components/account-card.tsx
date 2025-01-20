import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { BankTheme, FinanceAccount } from '@/types/finance';
import { FinanceBankName } from '@/types/finance';

interface AccountCardProps {
  account: FinanceAccount;
  backgroundColor?: string;
  textColor?: string;
  onEdit: (account: FinanceAccount) => void
}

const bankThemes: Record<FinanceBankName, BankTheme> = {
    [FinanceBankName.RBC]: {
      background: 'bg-gradient-to-br from-[#0051A5] to-[#00498F]',
      textColor: 'text-white'
    },
    [FinanceBankName.TD]: {
      background: 'bg-gradient-to-br from-[#2C8C28] to-[#1E5B1E]',
      textColor: 'text-white'
    },
    [FinanceBankName.CIBC]: {
      background: 'bg-gradient-to-br from-[#CE0E2D] to-[#B50D26]',
      textColor: 'text-white'
    },
    [FinanceBankName.BMO]: {
      background: 'bg-gradient-to-br from-[#0075BE] to-[#005587]',
      textColor: 'text-white'
    },
    [FinanceBankName.SCOTIABANK]: {
      background: 'bg-gradient-to-br from-[#EC111A] to-[#C60E15]',
      textColor: 'text-white'
    },
    [FinanceBankName.AMERICAN_EXPRESS]: {
      background: 'bg-gradient-to-br from-[#2E77BC] to-[#1C4F7C]',
      textColor: 'text-white'
    },
    [FinanceBankName.NATIONAL_BANK]: {
      background: 'bg-gradient-to-br from-[#DA291C] to-[#B22316]',
      textColor: 'text-white'
    },
    [FinanceBankName.HSBC_CANADA]: {
      background: 'bg-gradient-to-br from-[#DB0011] to-[#B2000E]',
      textColor: 'text-white'
    },
    [FinanceBankName.CANADIAN_TIRE_BANK]: {
      background: 'bg-gradient-to-br from-[#D31245] to-[#B30F3A]',
      textColor: 'text-white'
    },
    [FinanceBankName.SIMPLII_FINANCIAL]: {
      background: 'bg-gradient-to-br from-[#F26E21] to-[#D35D1B]',
      textColor: 'text-white'
    },
    [FinanceBankName.TANGERINE_BANK]: {
      background: 'bg-gradient-to-br from-[#FF6B00] to-[#E65C00]',
      textColor: 'text-white'
    },
    [FinanceBankName.EQ_BANK]: {
      background: 'bg-gradient-to-br from-[#652D90] to-[#4E2270]',
      textColor: 'text-white'
    },
    [FinanceBankName.LAURENTIAN_BANK]: {
      background: 'bg-gradient-to-br from-[#DC4405] to-[#B83804]',
      textColor: 'text-white'
    },
    [FinanceBankName.MANULIFE_BANK]: {
      background: 'bg-gradient-to-br from-[#00A758] to-[#008A48]',
      textColor: 'text-white'
    },
    [FinanceBankName.DUCA_CREDIT_UNION]: {
      background: 'bg-gradient-to-br from-[#0072BC] to-[#005A94]',
      textColor: 'text-white'
    },
    [FinanceBankName.VANCITY]: {
      background: 'bg-gradient-to-br from-[#E31937] to-[#C2152E]',
      textColor: 'text-white'
    },
    [FinanceBankName.COAST_CAPITAL]: {
      background: 'bg-gradient-to-br from-[#00698C] to-[#004D66]',
      textColor: 'text-white'
    },
    [FinanceBankName.DESJARDINS]: {
      background: 'bg-gradient-to-br from-[#008A47] to-[#006D38]',
      textColor: 'text-white'
    },
    [FinanceBankName.OTHER]: {
      background: 'bg-gradient-to-br from-gray-700 to-gray-900',
      textColor: 'text-white'
    }
  };

export function AccountCard(props: AccountCardProps) {
  const [account ] = useState<FinanceAccount>(props.account)

  const [showNumber, setShowNumber] = useState(false);

  const theme = bankThemes[account.bankName || FinanceBankName.OTHER] || bankThemes[FinanceBankName.OTHER];
  const finalBackground = theme.background;
  const finalTextColor = theme.textColor;

  const formatCardNumber = (number: string) => {
    if (showNumber) {
      return number;
    }
    // 保留最后四位，其他替换为 *
    const lastFourDigits = number.slice(-4);
    const maskedPart = number.slice(0, -4).replace(/\d/g, '*');
    return maskedPart + lastFourDigits;
  };

  return (
    <div className="relative group">
    <div className="w-96 h-56 perspective-[1000px] group">
      <div className="relative w-full h-full  ">
        <Card className={cn(
          "absolute w-full h-full overflow-hidden",
          finalBackground,
          "border-0"
        )}>               


          <div className="absolute top-10 right-14">
            <span className="text-white text-xl text-bold">{account.cardType}</span>

        </div>
          <div className="absolute top-20 left-6 w-12 h-9 bg-yellow-400 rounded-md" />
          
          <div className="absolute bottom-20 left-6 right-16 flex items-center justify-between">
            <div className={cn(
              "text-lg tracking-widest",
              finalTextColor
            )}>
              {formatCardNumber(account.accountNumber || '0000000000000000')}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 text-white hover:bg-white/20 right-1",
                finalTextColor
              )}
              onClick={() => setShowNumber(!showNumber)}
            >
              {showNumber ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className={cn(
            "absolute bottom-12 left-6 text-sm tracking-wider",
            finalTextColor
          )}>
            {account.cardHolder || 'Anonymous'}
          </div>
          
          <div className={cn(
            "absolute bottom-12 right-6 text-sm",
            finalTextColor
          )}>
            {account.expiryDate || '0000-00-00'}
          </div>
          
          <div className={cn(
            "absolute top-6 left-6 text-lg font-semibold",
            finalTextColor
          )}>
            {account.accountName}
          </div>
          
          <div className={cn(
            "absolute top-12 left-6 text-sm",
            finalTextColor
          )}>
            {account.bankName}
          </div>
          <div className={cn(
            "absolute bottom-4 left-6 text-xl font-bold",
            finalTextColor
          )}>
            {account.currency}: {account.balance}
          </div>

          <Button
        variant="ghost"
        size="icon"
        onClick={() => props.onEdit(account)}
        className={cn(
          "absolute top-0 right-0",
          finalTextColor,
          "hover:bg-white/20 rounded-full bg-white/20"
        )}>
        <Pencil className="h-4 w-4" />
      </Button>
        </Card>
      </div>
    </div>
    </div>
  );
};
