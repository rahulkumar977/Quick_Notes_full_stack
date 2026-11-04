import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { GridBackground } from '../../components/common/GridBackground';
import { authApi } from '../../services/authApi';
import { setCredentials, setLoading } from '../../store/slices/authSlice';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      toast.error('Please enter both email and password.');
      return;
    }

    dispatch(setLoading(true));

    try {
      const res = await authApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res.success && res.data?.user) {
        dispatch(setCredentials(res.data.user));
        toast.success('Signed in successfully!');
        navigate('/student/dashboard');
      }
    } catch (err) {
      // If user is unverified, redirect to verify-email
      if (err.message && err.message.toLowerCase().includes('verify')) {
        toast.error('Email verification required.');
        navigate('/verify-email', { state: { email: formData.email.trim() } });
      } else {
        toast.error(err.message || 'Invalid email or password.');
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <GridBackground isFullPage showGlow={true} mask="radial" className="flex items-center justify-center">
      <div className="md:min-w-lg w-full bg-white/95 dark:bg-[#0d0e13]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-8 space-y-6 shadow-2xl h-screen sm:h-auto transition-all md:my-4">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-block mb-1">
            <Logo size="md" onClick={() => navigate('/')} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to your student account to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-y-4">
          <TextField
            fullWidth
            size="small"
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@niu.edu.in"
          />

          <TextField
            fullWidth
            size="small"
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-slate-600 dark:text-slate-300" />
                      ) : (
                        <Eye size={18} className="text-slate-400 dark:text-slate-500" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <div className="flex items-center justify-between text-xs">
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{ color: 'var(--primary)', '&.Mui-checked': { color: 'var(--primary)' } }}
                />
              }
              label={<span className="text-xs text-slate-600 dark:text-slate-300">Remember me</span>}
            />

            <Link
              to="/forgot-password"
              className="text-primary dark:text-yellow-300 hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: 'var(--primary)',
              '&:hover': { backgroundColor: 'var(--primary-hover)' },
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              padding: '9px 16px',
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary dark:text-yellow-300 hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </GridBackground>
  );
};

export default LoginPage;
