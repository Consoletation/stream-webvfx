using UnityEngine;
using System.Collections;

namespace com.rehabstudio.chromecastCinema.audio
{

	public class SoundManager : MonoBehaviour {


		private static AudioClip[] m_audios;
		private static AudioListener m_listener;
		private static AudioSource m_musicSource;
		private static SoundManager m_instance;
		public static SoundManager Instance
		{
			get{

				if(m_instance ==  null)
				{
					m_audios = Resources.LoadAll<AudioClip>("Audio/");
					GameObject go = new GameObject(); 
					go.name = "SoundManager";
					m_listener = go.AddComponent<AudioListener>();
					m_instance = go.AddComponent<SoundManager>();
					m_musicSource = go.AddComponent<AudioSource>();
				}
				return m_instance;
			}
		}

		public void PlayMusic(string name)
		{
			AudioClip c = GetClipByName (name);
			if (c == null)
				return;

			m_musicSource.clip = c;
			m_musicSource.loop = true;
			m_musicSource.Play ();
		}

		public void PlayEffect(string name)
		{
			PlayEffect (name, gameObject);
		}

		public void PlayEffect(string name , GameObject go)
		{
			AudioClip c = GetClipByName (name);
			if (c == null)
				return;

			AudioSource source = go.GetComponent<AudioSource> ();

			if (source == null)
				source = go.AddComponent<AudioSource> ();

			source.clip = c;

			source.Play ();
		}

		private AudioClip GetClipByName(string name)
		{
			foreach (AudioClip clip in m_audios) {
			
				if(name == clip.name)
					return clip;
			}

			return null;
		}
	}
}