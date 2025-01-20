import { useState } from 'react'
import { X } from 'lucide-react'
import { Currency } from '@/types/enums'
import { FinanceAccount, FinanceAccountStatus, FinanceAccountType, FinanceAccountCardType, FinanceBankName } from '@/types/finance'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { validateAccount, FinanceAccountFormData } from '@/schemas/finance.schema';
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AccountFormProps {
  onSubmit: (account: FinanceAccount) => void
  onCancel: () => void
  onDelete: (id: string) => void
  initialData?: FinanceAccount | null
  isNewAccount: boolean
}

export function AccountForm({ onSubmit, onCancel, onDelete, initialData, isNewAccount }: AccountFormProps) {
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
    setAccount({ ...account, [name]: value })
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
  return (
    <div className="fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onCancel}
        >
          <X className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold mb-6">{initialData ? 'Edit Account' : 'Add Account'}</h2>
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
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
                {Object.values(FinanceBankName).map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {Object.values(FinanceAccountType).map((type) => (
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
                {Object.values(FinanceAccountCardType).map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
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
                <SelectValue placeholder="Select currency" defaultValue={Currency.CAD}/>
              </SelectTrigger>
              <SelectContent>
                {Object.values(Currency).map((currency) => (
                  <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="balance">Balance</Label>
            <Input
              id="balance"
              name="balance"
              type="number"
              value={account.balance}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Add'} Account
          </Button>
        </div>

        {initialData && !isNewAccount && (
          <div className="mt-8 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 mb-2">To delete this account, type "delete it" below and click the Delete button.</p>
            <div className="flex items-center space-x-2">
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type 'delete it' to confirm"
                className="w-full"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteConfirmation !== 'delete it'}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

