'use client'

import * as React from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Avatar,
  Typography,
  Chip,
  Button,
  Divider,
  Stack,
  Tooltip,
  LinearProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import MessageIcon from '@mui/icons-material/Message'
import FavoriteIcon from '@mui/icons-material/Favorite'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import Image from 'next/image'

export type HDCenter = { name: string; defined: boolean }

export type ProfileCardProps = {
  name: string
  username?: string
  location?: string
  avatarUrl?: string
  coverUrl?: string
  hdType?: string       // z. B. "Generator"
  profile?: string      // z. B. "6/3"
  tags?: string[]       // Interessen
  bio?: string

  // NEW: HD-Short
  centers?: HDCenter[]  // z. B. [{name:'Sakral', defined:true}, ...]

  // NEW: Compatibility
  compatibility?: number // 0..100

  // Actions
  onMessage?: () => void
  onLike?: () => void
  onNope?: () => void
  onEdit?: () => void
}

export default function ProfileCard(props: ProfileCardProps) {
  const {
    name, username, location,
    avatarUrl, coverUrl, hdType, profile,
    tags = [], bio,
    centers = [],
    compatibility,
    onMessage, onLike, onNope, onEdit,
  } = props

  // Farbe für Match-Badge je nach Wert
  const matchColor = React.useMemo(() => {
    const v = compatibility ?? 0
    if (v >= 80) return '#10B981'  // grün
    if (v >= 60) return '#F59E0B'  // amber
    return '#EF4444'               // rot
  }, [compatibility])

  return (
    <Card sx={{ overflow: 'hidden', borderRadius: 3, borderColor: '#22222F' }}>
      {/* Cover */}
      <Box sx={{ position: 'relative', height: 160, bgcolor: '#101017' }}>
        {coverUrl ? (
          <Image
            alt="Cover"
            src={coverUrl}
            fill
            priority
            style={{ objectFit: 'cover', opacity: 0.9 }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(90deg,#1b1b2b,#101018)' }} />
        )}

        {/* Match Badge */}
        {typeof compatibility === 'number' && (
          <Box
            sx={{
              position: 'absolute', top: 10, left: 10,
              px: 1.25, py: 0.5, borderRadius: 999,
              bgcolor: 'rgba(0,0,0,0.45)', border: '1px solid #2A2A3A',
              display: 'flex', alignItems: 'center', gap: 1
            }}
          >
            <Box sx={{
              width: 10, height: 10, borderRadius: '50%',
              backgroundColor: matchColor
            }} />
            <Typography variant="body2">Match {compatibility}%</Typography>
          </Box>
        )}

        {/* Actions oben rechts */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
          {onEdit && (
            <Tooltip title="Profil bearbeiten">
              <IconButton size="small" onClick={onEdit} sx={{ bgcolor: 'rgba(0,0,0,0.25)' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Avatar */}
        <Avatar
          src={avatarUrl}
          alt={name}
          sx={{
            width: 96, height: 96,
            position: 'absolute', bottom: -48, left: 24,
            border: '3px solid #0B0B12',
            bgcolor: '#2A2A3A',
            fontSize: 32,
          }}
        >
          {name?.charAt(0) ?? '?'}
        </Avatar>
      </Box>

      {/* Header-Infos */}
      <CardHeader
        sx={{ pt: 6, pb: 1 }}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{name}</Typography>
            {username && (
              <Typography variant="body2" color="text.secondary">
                @{username}
              </Typography>
            )}
          </Box>
        }
        subheader={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {!!location && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOnIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                <Typography variant="body2" color="text.secondary">
                  {location}
                </Typography>
              </Stack>
            )}
            {(hdType || profile) && (
              <Typography variant="body2" color="text.secondary">
                • {hdType ?? '—'} {profile ? `· ${profile}` : ''}
              </Typography>
            )}
          </Stack>
        }
        action={
          <Stack direction="row" spacing={1}>
            {onMessage && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<MessageIcon />}
                onClick={onMessage}
              >
                Anschreiben
              </Button>
            )}
          </Stack>
        }
      />

      <CardContent sx={{ pt: 1 }}>
        {/* Tags */}
        {tags.length > 0 && (
          <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.slice(0, 8).map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                variant="outlined"
                sx={{ borderColor: '#2A2A3A', color: 'text.secondary' }}
              />
            ))}
          </Box>
        )}

        {/* Bio */}
        {bio && (
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 1.5 }}>
            {bio}
          </Typography>
        )}

        {/* Kompatibilitäts-Bar (optional) */}
        {typeof compatibility === 'number' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Kompatibilität</Typography>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, compatibility))}
              sx={{
                height: 8, borderRadius: 999, mt: 0.5,
                '& .MuiLinearProgress-bar': { backgroundColor: matchColor }
              }}
            />
          </Box>
        )}

        {/* HD Kurzfassung: Zentren */}
        {centers.length > 0 && (
          <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {centers.map((c) => (
              <Chip
                key={c.name}
                label={`${c.name}${c.defined ? '' : ' (offen)'}`}
                size="small"
                variant={c.defined ? 'filled' : 'outlined'}
                color={c.defined ? 'primary' : 'default'}
                sx={{
                  bgcolor: c.defined ? 'rgba(124,58,237,0.15)' : 'transparent',
                  borderColor: '#2A2A3A',
                }}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2, borderColor: '#23233A' }} />

        {/* Action-Leiste (Swipe/Chat) */}
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <IconButton
            onClick={onNope}
            sx={{ bgcolor: 'rgba(239,68,68,0.12)', color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}
          >
            <CloseIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<MessageIcon />}
            onClick={onMessage}
            sx={{ flexGrow: 1, mx: 1 }}
          >
            Chat
          </Button>
          <IconButton
            color="primary"
            onClick={onLike}
            sx={{ bgcolor: 'rgba(124,58,237,0.15)', '&:hover': { bgcolor: 'rgba(124,58,237,0.25)' } }}
          >
            <FavoriteIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  )
}
