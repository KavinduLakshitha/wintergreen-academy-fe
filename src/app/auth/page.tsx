'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import axios from 'axios'
import Image from 'next/image'

type AuthMode = 'signin' | 'forgotPassword'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Branch {
    id: number;
    name: string;
}

export default function AuthPage() {
  const [mode] = useState<AuthMode>('signin');
  const [userid, setUserID] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [branch, setBranch] = useState("")
  const [branches, setBranches] = useState<Branch[]>([])
  const [fetchingBranches, setFetchingBranches] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!userid || userid.trim().length < 3) {
        setBranches([]);
        setBranch("");
        return;
    }
    
    const fetchBranches = async () => {
        setFetchingBranches(true);
        setError(null);
        try {
        const response = await axios.get(`${API_URL}/api/auth/branches`, {
            params: { username: userid.trim() },
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            }
        });


        if (response.data && Array.isArray(response.data)) {
            setBranches(response.data);

            // Auto-select if there's only one branch
            if (response.data.length === 1) {
            setBranch(response.data[0].id.toString());
            }
            // Reset branch if the current selection is no longer valid
            else if (branch && !response.data.some(br => br.id.toString() === branch)) {
            setBranch("");
            }
        } else {
            setBranches([]);
            // Don't show error when there are simply no branches
            if (userid.trim().length >= 3) {
            setBranch("");
            }
        }
        } catch (err) {
        console.error('Error fetching branches:', err);
        setBranches([]);
        } finally {
        setFetchingBranches(false);
        }
    };


    const timeoutId = setTimeout(fetchBranches, 800);
    return () => clearTimeout(timeoutId);
    }, [userid, branch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode == 'signin') {
          const branchId = branch ? branch : undefined

          // Only require branch selection for non-superadmin users
          if (!branchId && branches.length > 0 && userid.toLowerCase() !== 'superadmin') {
              throw new Error('Please select a branch')
          }

          const response = await axios.post(`${API_URL}/api/auth/login`, {
              username: userid,
              password: password,
              branchId: branchId
          })

          const { token, user } = response.data
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))

          router.push('/dashboard')
      }
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'An unexpected error occurred'
            )
        } else if (err instanceof Error) {
            setError(err.message)
        } else {
            setError('An unexpected error occurred')
        }
    } finally {
        setIsLoading(false)
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md shadow-xl">
            <div className="flex justify-center">
                <div className="relative w-52 h-52">
                    <Image
                        src="/logo.webp"
                        alt="Company Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>
            
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
                    Welcome Back
                </CardTitle>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Please sign in to continue
                </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
                {error && (
                    <Alert variant="destructive" className="animate-shake">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium dark:text-gray-300">UserID</Label>
                        <Input 
                            type="text" 
                            value={userid}
                            onChange={(e) => setUserID(e.target.value)}
                            required 
                            placeholder="Enter your UserID"
                            className="h-11 dark:bg-gray-800 dark:text-gray-200 border-slate-300 focus:border-[#2E8B57] focus:ring-[#2E8B57]"
                            disabled={isLoading}
                            autoComplete="username"
                            name="username"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium dark:text-gray-300">Password</Label>
                        <div className="relative">
                            <Input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                placeholder="Enter your password"
                                className="h-11 pr-10 dark:bg-gray-800 dark:text-gray-200 border-slate-300 focus:border-[#2E8B57] focus:ring-[#2E8B57]"
                                disabled={isLoading}
                                autoComplete="current-password"
                                name="password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2E8B57] dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                            <Label className="text-sm font-medium dark:text-gray-300">
                                Branch {userid.toLowerCase() === 'superadmin' ? '(Optional)' : ''}
                            </Label>
                            <Select 
                                onValueChange={setBranch} 
                                value={branch}
                                disabled={isLoading || !userid || userid.trim().length < 3 || fetchingBranches}
                                name="branch"
                            >
                                <SelectTrigger className="h-11 border-slate-300 focus:border-[#2E8B57] focus:ring-[#2E8B57]">
                                    <SelectValue placeholder={
                                        fetchingBranches ? "Loading branches..." :
                                        !userid || userid.trim().length < 3 ? "Enter at least 3 characters" :
                                        branches.length === 0 ? "No branches available" :
                                        userid.toLowerCase() === 'superadmin' ? "Select a Branch (Optional)" :
                                        "Select a Branch"
                                    } />
                                </SelectTrigger>
                                {branches.length > 0 && (
                                    <SelectContent>
                                        {branches.map((br) => (
                                            <SelectItem 
                                                key={br.id} 
                                                value={br.id.toString()}
                                            >
                                                {br.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                )}
                            </Select>
                            {userid && userid.trim().length >= 3 && !fetchingBranches && branches.length === 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    No authorized branches found for this user
                                </p>
                            )}
                        </div>

                    <Button 
                        type="submit" 
                        className="w-full h-11 text-base font-medium transition-all duration-200 bg-[#2E8B57] hover:bg-[#228B22] text-white cursor-pointer"
                        disabled={isLoading || (!branch && branches.length > 0 && userid.toLowerCase() !== 'superadmin') || branches.length === 0}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}