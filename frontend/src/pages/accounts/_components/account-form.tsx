import { useState } from 'react'
import { X } from 'lucide-react'
import { Currency } from '@/types/enums'
import { FinanceAccount, FinanceAccountStatus, FinanceAccountType, FinanceAccountCardType, FinanceBankName } from '@/types/finance/finance.type'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { validateAccount, FinanceAccountFormData } from '@/schemas/finance.schema';
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AccountFormProps {
  onSubmit: (account: FinanceAccount) => void
  onCancel: () => void
  onDelete: (id: string) => void
  initialData?: FinanceAccount | null
  isNewAccount: boolean
  open: boolean
}

export function AccountForm({ onSubmit, onCancel, onDelete, initialData, isNewAccount, open }: AccountFormProps) {
  const [account, setAccount] = useState<FinanceAccountFormData>(
    initialData || {
      accountName: '',
      bankName: FinanceBankName.RBC,
      accountType: FinanceAccountType.CHEQUING,
      currency: Currency.CAD,
      balance: 0,
      cardType: FinanceAccountCardType.VISA,
      id: '',
      accountNumber: '',
    }
  )
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'balance') {
      // 移除非数字和小数点以外的字符
      const cleanValue = value.replace(/[^\d.]/g, '')
      // 确保只有一个小数点
      const parts = cleanValue.split('.')
      const formattedValue = parts.length > 2 
        ? `${parts[0]}.${parts.slice(1).join('')}`
        : cleanValue
      setAccount({ ...account, [name]: parseFloat(formattedValue) || 0 })
    } else if (name === 'accountNumber') {
      // 移除所有非数字字符
      const cleanValue = value.replace(/\D/g, '')
      setAccount({ ...account, [name]: cleanValue })
    } else {
      setAccount({ ...account, [name]: value })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setAccount({ ...account, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationResult = validateAccount(account)
    if (!validationResult.success) {
      setErrors(validationResult.errors)
    } else {
      setErrors([])
      onSubmit(account as FinanceAccount)
    }
  }

  const handleDelete = () => {
    if (deleteConfirmation === 'delete it' && initialData) {
      onDelete(initialData.id)
    }
  }

  // 格式化显示金额
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // 格式化显示账号
  const formatAccountNumber = (value: string | undefined) => {
    if (!value) return '';
    // 每4位添加一个空格
    return value.replace(/(.{4})/g, '$1 ').trim();
  }

  const bankNameOptions = Object.values(FinanceBankName);
  const accountTypeOptions = Object.values(FinanceAccountType);
  const cardTypeOptions = Object.values(FinanceAccountCardType);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Account' : 'Add Account'}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'Edit your account details below.' 
              : 'Add a new account to track your finances.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                name="accountName"
                value={account.accountName}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="e.g. My Checking Account"
              />
            </div>

            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Select
                value={account.bankName}
                onValueChange={(value) => handleSelectChange('bankName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank name" />
                </SelectTrigger>
                <SelectContent>
                  {bankNameOptions.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                value={formatAccountNumber(account.accountNumber)}
                onChange={handleChange}
                type="text"
                pattern="[0-9\s]*"
                required
                className="w-full font-mono"
                placeholder="1234 5678 9012 3456"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter the account number without spaces
              </p>
            </div>

            <div>
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                value={account.accountType}
                onValueChange={(value) => handleSelectChange('accountType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cardType">Card Type</Label>
              <Select
                value={account.cardType}
                onValueChange={(value) => handleSelectChange('cardType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  {cardTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={account.currency}
                onValueChange={(value) => handleSelectChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Currency).map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="balance">Balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {account.currency}
                </span>
                <Input
                  id="balance"
                  name="balance"
                  type="text"
                  value={formatCurrency(account.balance)}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 font-mono"
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Enter amount with up to 2 decimal places
              </p>
            </div>

            {!isNewAccount && (
              <div className="pt-6 border-t">
                <Label htmlFor="deleteConfirmation" className="text-destructive">
                  Delete Account
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Type 'delete it' to confirm deletion
                </p>
                <div className="space-y-2">
                  <Input
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    className="w-full"
                    disabled={deleteConfirmation !== 'delete it'}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? 'Update Account' : 'Add Account'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
