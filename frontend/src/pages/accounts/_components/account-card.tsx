import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardBackgroundThemes, FinanceAccount } from '@/types/finance/finance.type';
import { FinanceBankName } from '@/types/finance/finance.type';

interface AccountCardProps {
  account: FinanceAccount;
  backgroundColor?: string;
  textColor?: string;
  onEdit: (account: FinanceAccount) => void
}


export function AccountCard(props: AccountCardProps) {
  const { account } = props;
  const [showNumber, setShowNumber] = useState(false);

  const theme = CardBackgroundThemes[account.bankName || FinanceBankName.OTHER] || CardBackgroundThemes[FinanceBankName.OTHER];
  console.log('theme', theme);
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
    <div className="relative w-full hover:scale-105 transition-transform duration-200">
      <div className="w-full aspect-[1.58/1] perspective-[1000px]">
        <div className="relative w-full h-full transform-gpu transition-transform duration-500 ease-in-out">
          <Card className={cn(
            "absolute w-full h-full overflow-hidden",
            finalBackground,
            "border-0 shadow-lg"
          )}>               
            <div className="absolute top-[10%] right-[10%]">
              <span className="text-white text-sm font-medium">{account.cardType}</span>
            </div>

            <div className="absolute top-[25%] left-[5%] w-[12%] aspect-[4/3] bg-yellow-400 rounded-md" />
            
            <div className="absolute bottom-[35%] left-[5%] right-[5%] flex items-center justify-between">
              <div className={cn(
                "text-sm tracking-widest",
                finalTextColor
              )}>
                {formatCardNumber(account.accountNumber || '0000000000000000')}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 hover:bg-white/20",
                  finalTextColor
                )}
                onClick={() => setShowNumber(!showNumber)}
              >
                {showNumber ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            </div>
            
            <div className={cn(
              "absolute bottom-[20%] left-[5%] text-xs tracking-wider",
              finalTextColor
            )}>
              {account.cardHolder || 'Anonymous'}
            </div>
            
            <div className={cn(
              "absolute bottom-[20%] right-[5%] text-xs",
              finalTextColor
            )}>
              {account.expiryDate || '0000-00-00'}
            </div>
            
            <div className={cn(
              "absolute top-[10%] left-[5%] text-sm font-semibold",
              finalTextColor
            )}>
              {account.bankName} - {account.accountName}
            </div>
            


            <div className={cn(
              "absolute bottom-[8%] left-[5%] text-sm font-bold",
              finalTextColor
            )}>
              {account.currency}: {account.balance}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => props.onEdit(account)}
              className={cn(
                "absolute top-1 right-1",
                finalTextColor,
                "hover:bg-white/20 rounded-full bg-white/20 h-6 w-6"
              )}>
              <Pencil className="h-3 w-3" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
